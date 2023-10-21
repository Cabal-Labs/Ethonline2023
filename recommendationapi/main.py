from flask import Flask, request, jsonify
from pyspark.ml.recommendation import ALSModel
from pyspark.ml.feature import StringIndexerModel
from pyspark.sql import SparkSession
from pyspark.sql.functions import explode, col
from pyspark.ml.feature import IndexToString

app = Flask(__name__)

# Initialize Spark Session
spark = SparkSession.builder.appName("recommend") \
    .config("spark.jars.packages", "io.delta:delta-core_2.12:2.2.0") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")\
    .config("spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog")\
    .config("spark.executor.memory", "4g") \
    .config("spark.driver.memory", "4g") \
    .config("spark.ui.showConsoleProgress", "true") \
    .config("spark.sql.legacy.timeParserPolicy", "LEGACY").getOrCreate()

# Load your trained ALS model and StringIndexerModel
model = ALSModel.load("weights")
user_indexer = StringIndexerModel.load("user_model")
post_indexer = StringIndexerModel.load("post_model")


@app.route('/recommend', methods=['POST'])
def recommend():
    user_id = request.json['user_id']
    user_df = spark.createDataFrame([(user_id,)], ["userId"])

    # Transform the user_id using the StringIndexerModel
    user_df = user_indexer.transform(user_df)

    user_recommendations = model.recommendForUserSubset(user_df, 5)

    # Convert recommendations to DataFrame
    recs_df = spark.createDataFrame(user_recommendations.collect(), [
                                    "userId", "recommendations"])

    recs_df.show(5)
    # Explode the recommendations column into separate rows
    recs_df = recs_df.select("userId", explode(
        "recommendations").alias("recommendation"))

    # Separate the recommendation struct into two separate columns
    recs_df = recs_df.select("userId", "recommendation.*")

    # Rename the columns to match the post_indexer input
    recs_df = recs_df.withColumnRenamed(
        "col1", "postId").withColumnRenamed("col2", "rating")

    recs_df.show()

    # Create an IndexToString transformer
    index_to_string = IndexToString(
        inputCol="postIdIndex", outputCol="originalPostId", labels=post_indexer.labels)

    # Apply the post_indexer's inverse transformation
    recs_df = index_to_string.transform(recs_df)

    print("transformed")
    recs_df.show()

   # originalPostId_array = recs_df.select(
  #      "originalPostId").rdd.flatMap(lambda x: x).collect()
   # print(originalPostId_array)

    # Convert the DataFrame to JSON and return
    return recs_df


if __name__ == '__main__':
    app.run(debug=True)
