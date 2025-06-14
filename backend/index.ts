import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { questionRoutes } from "./src/routes/questions";
import { topicRoutes } from "./src/routes/topics";
import { leaderBoardRoutes } from "./src/routes/leaderboard";

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware (if needed for frontend)
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);

	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.use("/questions", questionRoutes);
app.use("/topics", topicRoutes);
app.use("/leaderboard", leaderBoardRoutes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
	console.log("health");
	res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
	console.error("Unhandled error:", error);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error:
			process.env.NODE_ENV === "development"
				? error.message
				: "Something went wrong",
	});
});

// For local development
if (process.env.NODE_ENV !== "production") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

// Export for AWS Lambda
export const handler = serverless(app);
