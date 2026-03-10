import json
import os
import boto3

ses = boto3.client('ses')
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'https://cirrostratus.cloud').split(',')
api_key = os.environ.get('API_KEY', '')

def handler(event, context):
    # CORS headers for all responses (Function URL injects Access-Control-Allow-Origin)
    cors_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type,X-API-Key',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    # For Lambda Function URLs, check requestContext.http.method
    method = event.get('requestContext', {}).get('http', {}).get('method', '').upper()
    
    # Handle OPTIONS preflight request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    # Check API key
    provided_key = event.get('headers', {}).get('x-api-key', '')
    if provided_key != api_key:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', '')
        email = body.get('email', '')
        message = body.get('message', '')
        company = body.get('company', '')
        project_type = body.get('project-type', '')
        
        if not all([name, email, message]):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Build the full message with company and project type
        full_message = f'Name: {name}\nEmail: {email}\n'
        if company:
            full_message += f'Company: {company}\n'
        if project_type:
            full_message += f'Project Type: {project_type}\n'
        full_message += f'\nMessage:\n{message}'
        
        recipient = os.environ['RECIPIENT_EMAIL']
        ses.send_email(
            Source=recipient,
            Destination={'ToAddresses': [recipient]},
            Message={
                'Subject': {'Data': f'Contact Form: {name}'},
                'Body': {'Text': {'Data': full_message}}
            }
        )
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'success': True})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
