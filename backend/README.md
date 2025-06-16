# Quiz App Backend

A TypeScript Express.js API designed to run on AWS Lambda for a quiz application.

## Features

- **GET /health** - Health check endpoint
- **GET /topics** - Retrieve all quiz topics
- **GET /topics/:id** - Get questions for a specific topic
- **POST /topics** - Create a new topic
- **POST /leaderboard** - Submit user scores
- **GET /leaderboard** - View leaderboard (bonus endpoint)

## Project Structure

```
backend/
├── index.ts           # Main application file
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── serverless.yml     # Serverless Framework configuration
└── dist/              # Compiled JavaScript (after build)
```

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run deploy` - Build and deploy to AWS Lambda

## API Endpoints

### GET /questions

eg: https://28dnbgw3mk.execute-api.us-east-1.amazonaws.com/dev/questions/:topicId
topicId: eccca8bf-9e47-4409-b77e-94f149afb607
Returns all available questions of that topic.

**Response:**

```json
{
  "questions": [
    {
      "id": "3baef9ff-9b05-47c6-ac6b-b2028f1d784a",
      "topicId": "9f4cdfed-f317-4986-bbf7-11b3adbb271e",
      "question": "How many holes are there in a standard round of golf?",
      "answers": ["18", "9", "12", "16"],
      "correctAnswer": "18"
    }
  ]
}
```

### GET /topics

Returns all available quiz topics.
eg: https://28dnbgw3mk.execute-api.us-east-1.amazonaws.com/dev/topics
**Response:**

```json
{
  "topics": [
    {
      "id": "2e3f26c3-8c6e-4850-93d1-d0934f02aa5d",
      "name": "History"
    },
    {
      "id": "a7f8da14-0419-479c-94f7-7a82cc2b8c48",
      "name": "Programming"
    }
  ]
}
```

### POST /topics

Create a new topic.

**Request Body:**

```json
{
  "name": "New Topic",
  "description": "Topic description",
  "difficulty": "beginner"
}
```

### POST /leaderboard

Submit a user's quiz score.

**Request Body:**

```json
{
  "userId": "user123",
  "username": "johndoe",
  "topicId": "1",
  "score": 8,
  "totalQuestions": 10
}
```

## AWS Lambda Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Serverless Framework installed globally: `npm install -g serverless`

### Environment Variables

Set these environment variables in AWS Lambda or locally for testing:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing

### Deploy to AWS

1. Build the project:

```bash
npm run build
```

2. Deploy using Serverless Framework:

```bash
serverless deploy
```

Or use the combined command:

```bash
npm run deploy
```

### Local Lambda Testing

You can test the Lambda function locally using:

```bash
serverless offline
```

## Technology Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Deployment**: AWS Lambda via Serverless Framework
- **Database**: MongoDB (ready for integration)
- **Authentication**: JWT (ready for integration)

## Current Status

This is the initial version with mock data. The following features are ready for implementation:

- [ ] MongoDB integration for persistent data
- [ ] User authentication with JWT
- [ ] Input validation and sanitization
- [ ] Rate limiting
- [ ] Logging and monitoring
- [ ] Unit and integration tests

## API Testing

You can test the API endpoints using curl or any HTTP client:

```bash
# Get all topics
curl https://your-api-gateway-url/topics

# Get questions for topic 1
curl https://your-api-gateway-url/topics/1

# Create a new topic
curl -X POST https://your-api-gateway-url/topics \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Topic","description":"Test description","difficulty":"beginner"}'

# Submit a score
curl -X POST https://your-api-gateway-url/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","username":"testuser","topicId":"1","score":8,"totalQuestions":10}'
```

## Error Handling

The API includes comprehensive error handling:

- 400 Bad Request for invalid input
- 404 Not Found for non-existent resources
- 500 Internal Server Error for server issues

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```
