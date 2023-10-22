from flask import Flask, request, jsonify
from pyspark.ml.recommendation import ALSModel
from pyspark.ml.feature import StringIndexerModel
from pyspark.sql import SparkSession
from pyspark.sql.functions import explode, col
from pyspark.ml.feature import IndexToString
import os
import requests
import json
from flask_cors import CORS
from flask_caching import Cache

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://hey.xyz"]}})

cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)


os.environ["JAVA_HOME"] = "/usr/lib/jvm/java-11-openjdk-amd64"

print(os.environ["JAVA_HOME"])

# Initialize Spark Session
spark = SparkSession.builder.appName("recommend") \
    .config("spark.jars.packages", "io.delta:delta-core_2.12:2.2.0") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")\
    .config("spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog")\
    .config("spark.executor.memory", "64g") \
    .config("spark.driver.memory", "64g") \
    .config("spark.ui.showConsoleProgress", "true") \
    .config("spark.memory.storageFraction", "0.6") \
    .config("spark.executor.extraJavaOptions", "-XX:+UseG1GC") \
    .config("spark.sql.legacy.timeParserPolicy", "LEGACY").getOrCreate()

# Load your trained ALS model and StringIndexerModel
model = ALSModel.load("weights")
user_indexer = StringIndexerModel.load("user_model")
post_indexer = StringIndexerModel.load("post_model")


def run_query(pub):
    headers = {'Content-Type': 'application/json'}

    built_query = create_query(pub)

    print(built_query)
    request = requests.post('https://api.lens.dev/',
                            json={'query': built_query}, headers=headers)

    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(
            request.status_code))


# The GraphQL query (with a few admissible variables)
def create_query(publication_id):
    query = """
	query Publication {
	publication(request: {
		publicationId: \"""" + publication_id + """\"
	}) {
	__typename 
		... on Post {
		...PostFields
		}
		... on Comment {
		...CommentFields
		}
		... on Mirror {
		...MirrorFields
		}
	}
	}

	fragment MediaFields on Media {
	url
	mimeType
	}

	fragment ProfileFields on Profile {
	id
	name
	bio
	attributes {
		displayType
		traitType
		key
		value
	}
	isFollowedByMe
	isFollowing(who: null)
	followNftAddress
	metadata
	isDefault
	handle
	picture {
		... on NftImage {
		contractAddress
		tokenId
		uri
		verified
		}
		... on MediaSet {
		original {
			...MediaFields
		}
		}
	}
	coverPicture {
		... on NftImage {
		contractAddress
		tokenId
		uri
		verified
		}
		... on MediaSet {
		original {
			...MediaFields
		}
		}
	}
	ownedBy
	dispatcher {
		address
	}
	stats {
		totalFollowers
		totalFollowing
		totalPosts
		totalComments
		totalMirrors
		totalPublications
		totalCollects
	}
	followModule {
		...FollowModuleFields
	}
	}

	fragment PublicationStatsFields on PublicationStats { 
	totalAmountOfMirrors
	totalAmountOfCollects
	totalAmountOfComments
	totalUpvotes
	}

	fragment MetadataOutputFields on MetadataOutput {
	name
	description
	content
	media {
		original {
		...MediaFields
		}
	}
	attributes {
		displayType
		traitType
		value
	}
	}

	fragment Erc20Fields on Erc20 {
	name
	symbol
	decimals
	address
	}

	fragment PostFields on Post {
	id
	profile {
		...ProfileFields
	}
	stats {
		...PublicationStatsFields
	}
	metadata {
		...MetadataOutputFields
	}
	createdAt
	collectModule {
		...CollectModuleFields
	}
	referenceModule {
		...ReferenceModuleFields
	}
	appId
	hidden
	reaction(request: null)
	mirrors(by: null)
	hasCollectedByMe
	}

	fragment MirrorBaseFields on Mirror {
	id
	profile {
		...ProfileFields
	}
	stats {
		...PublicationStatsFields
	}
	metadata {
		...MetadataOutputFields
	}
	createdAt
	collectModule {
		...CollectModuleFields
	}
	referenceModule {
		...ReferenceModuleFields
	}
	appId
	hidden
	reaction(request: null)
	hasCollectedByMe
	}

	fragment MirrorFields on Mirror {
	...MirrorBaseFields
	mirrorOf {
	... on Post {
		...PostFields          
	}
	... on Comment {
		...CommentFields          
	}
	}
	}

	fragment CommentBaseFields on Comment {
	id
	profile {
		...ProfileFields
	}
	stats {
		...PublicationStatsFields
	}
	metadata {
		...MetadataOutputFields
	}
	createdAt
	collectModule {
		...CollectModuleFields
	}
	referenceModule {
		...ReferenceModuleFields
	}
	appId
	hidden
	reaction(request: null)
	mirrors(by: null)
	hasCollectedByMe
	}

	fragment CommentFields on Comment {
	...CommentBaseFields
	mainPost {
		... on Post {
		...PostFields
		}
		... on Mirror {
		...MirrorBaseFields
		mirrorOf {
			... on Post {
			...PostFields          
			}
			... on Comment {
			...CommentMirrorOfFields        
			}
		}
		}
	}
	}

	fragment CommentMirrorOfFields on Comment {
	...CommentBaseFields
	mainPost {
		... on Post {
		...PostFields
		}
		... on Mirror {
		...MirrorBaseFields
		}
	}
	}

	fragment FollowModuleFields on FollowModule {
	... on FeeFollowModuleSettings {
		type
		amount {
		asset {
			name
			symbol
			decimals
			address
		}
		value
		}
		recipient
	}
	... on ProfileFollowModuleSettings {
		type
		contractAddress
	}
	... on RevertFollowModuleSettings {
		type
		contractAddress
	}
	... on UnknownFollowModuleSettings {
		type
		contractAddress
		followModuleReturnData
	}
	}

	fragment CollectModuleFields on CollectModule {
	__typename
	... on FreeCollectModuleSettings {
		type
		followerOnly
		contractAddress
	}
	... on FeeCollectModuleSettings {
		type
		amount {
		asset {
			...Erc20Fields
		}
		value
		}
		recipient
		referralFee
	}
	... on LimitedFeeCollectModuleSettings {
		type
		collectLimit
		amount {
		asset {
			...Erc20Fields
		}
		value
		}
		recipient
		referralFee
	}
	... on LimitedTimedFeeCollectModuleSettings {
		type
		collectLimit
		amount {
		asset {
			...Erc20Fields
		}
		value
		}
		recipient
		referralFee
		endTimestamp
	}
	... on RevertCollectModuleSettings {
		type
	}
	... on TimedFeeCollectModuleSettings {
		type
		amount {
		asset {
			...Erc20Fields
		}
		value
		}
		recipient
		referralFee
		endTimestamp
	}
	... on UnknownCollectModuleSettings {
		type
		contractAddress
		collectModuleReturnData
	}
	}

	fragment ReferenceModuleFields on ReferenceModule {
	... on FollowOnlyReferenceModuleSettings {
		type
		contractAddress
	}
	... on UnknownReferenceModuleSettings {
		type
		contractAddress
		referenceModuleReturnData
	}
	... on DegreesOfSeparationReferenceModuleSettings {
		type
		contractAddress
		commentsRestricted
		mirrorsRestricted
		degreesOfSeparation
	}
	}

    """
    return query


@app.route('/recommend', methods=['POST'])
@cache.memoize(timeout=600)  # Cache for 10 minutes
def recommend():
    user_id = request.json['user_id']
    user_df = spark.createDataFrame([(user_id,)], ["userId"])

    # Transform the user_id using the StringIndexerModel
    user_df = user_indexer.transform(user_df)

    user_recommendations = model.recommendForUserSubset(user_df, 10)

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

    print("transforming...")
    # Apply the post_indexer's inverse transformation
    recs_df = index_to_string.transform(recs_df)

    print("transformed")
    recs_df.show(5)

    array_from_column = [row['originalPostId'] for row in recs_df.collect()]

    results = []
    for item in array_from_column:
        result = run_query(item)
        results.append(result)

    # Convert the DataFrame to JSON and return
    return results


@app.route('/names', methods=['POST'])
def names():

    a = [
        "0x015fc9-0xee",
        "0x01aa6a-0x54",
        "0x0136a4-0x0104",
        "0x01bd22-0x2b",
        "0x0f6a-0xee"
    ]

    results = []
    for item in a:
        result = run_query(item)
        results.append(result)

    # Convert the DataFrame to JSON and return
    return results


if __name__ == '__main__':
    app.run(debug=True)
