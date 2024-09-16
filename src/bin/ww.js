import app from "../index.js";
import docRouter from "../routes/docs.js";

//attach docs
app.use("/docs", docRouter);
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Start the server

export default app;
