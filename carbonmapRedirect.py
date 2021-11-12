# this is the lambda@edge function that takes care of the redirects
# if the site is hosted on S3 + Cloudflare
import json

def lambda_handler(event, context):
    request = event['Records'][0]['cf']['request']
    host_header = request["headers"]["host"][0]["value"]
    uri = request['uri']
    if host_header == 'carbonmap.org':
      response = {
             'status': '301',
             'statusDescription': 'Found',
             'headers': {
                 'location': [{
                     'key': 'Location',
                     "value": f"https://www.carbonmap.org{uri}"
                 }]
             }
         }
      return response
    print(f'request was {request}')
    # Generate HTTP redirect response with 301 status code and Location header.
    if request['uri'] == '/guardian':
      response = {
             'status': '301',
             'statusDescription': 'Found',
             'headers': {
                 'location': [{
                     'key': 'Location',
                     "value": "https://www.carbonmap.org/?header=hidden"
                 }]
             }
         }
      return response
    elif request['uri'] == '/downloads/CarbonMapScreenGrab.mov':
      response = {
             'status': '301',
             'statusDescription': 'Found',
             'headers': {
                 'location': [{
                     'key': 'Location',
                     "value": "https://www.carbonmap.org/downloads/CarbonMap.mov"
                 }]
             }
         }
      return response
    return request