# Dependencies
import tweepy
import json

# Credentials
consumer_key = "ho0syaVOcYapNnj2gtCFfF5io"
consumer_secret = "WN5xsDa2ufNVPR9MPJkHxVwTSxREYY8JxMG6sI8tQ8wrHDmITW"
access_token = "907733914470567937-7Us4vjLpARCIOrJCZoYLqBxVMqYPUUU"
access_token_secret = "ypNiR5CCZQn8clBmeX25glfGi07ZuEUiJw4xxcX319KuV"

# Use Tweepy to Authenticate our access
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth, parser=tweepy.parsers.JSONParser())
public_tweets = api.user_timeline()
#target_user = "GuardianData"

# Get all tweets from the home feed


# Loop through all tweets
for tweet in public_tweets:

    # Print the JSON object
    print(json.dumps(tweet, sort_keys=True, indent=4, separators=(',', ': ')))
