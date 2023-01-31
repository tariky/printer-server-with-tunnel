import ngrok from "ngrok";
import express from "express";
import bodyParser from "body-parser";
import queryString from "query-string";
import axios from "axios";
import cors from "cors";

const app = express();
const port = 7878;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

(async function () {
	const url = await ngrok.connect({
		authtoken: process.env.NGROK_AUTHTOKEN,
		port: "7878",
	});

	// Update Ulaz robe printer link to generated tunnel url
	await axios.put(
		process.env.DEV
			? `http://localhost:3000/api/settings`
			: process.env.PRODUCTION_URL,
		{
			printer_link: url,
		}
	);

	// Check if server is alive
	app.get("/", (req, res) => {
		res.json({
			msg: `Printing server is running on port:7878`,
			tunnelUrl: url,
		});
	});

	// Printing service that connects
	// web app with local nicelabel printing server
	app.post("/ulaz/print", async (req, res) => {
		const stikerData = queryString.stringify({
			sku: req.body.sku,
			dobkod: req.body.dobkod,
			quantity: req.body.quantity,
		});
		const result = await axios.get(
			`http://localhost:56426/print?${stikerData}`
		);
		res.json(result.data);
	});

	// Use this route to send test stickers
	app.post("/ulaz/print/test", async (req, res) => {
		const stikerData = queryString.stringify({
			sku: req.body.sku,
			dobkod: req.body.dobkod,
			quantity: req.body.qunatity,
		});
		res.json(stikerData);
	});

	app.listen(port, () => {
		console.log(`Printing server is running on http://localhost:${port}`);
		console.log(`Tunnel URL: ${url}`);
	});
})();
