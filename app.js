var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var compress = require("compression");

var indexRouter = require("./routes/index");

var app = express();

var isProd = process.env.NODE_ENV === "production";

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// Trust "X-Forwarded-For" and "X-Forwarded-Proto" nginx headers
app.enable("trust proxy");

// Disable "powered by express" header
app.set("x-powered-by", false);

// Pretty print JSON
app.set("json spaces", 2);

// Use GZIP
app.use(compress());

app.use(function (req, res, next) {
	// Force SSL
	if (isProd && req.protocol !== "https") {
		return res.redirect(
			"https://" + (req.hostname || "instant.io") + req.url //all this is handled on nginx proxy manager and cloudflare
		);
	}

	// Redirect www to non-www
	if (isProd && req.hostname === "www.instant.io") {
		return res.redirect("https://instant.io" + req.url);
	}

	// Use HTTP Strict Transport Security
	// Lasts 1 year, incl. subdomains, allow browser preload list
	if (isProd) {
		res.header(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains; preload"
		);
	}

	// Add cross-domain header for fonts, required by spec, Firefox, and IE.
	var extname = path.extname(req.url);
	if ([".eot", ".ttf", ".otf", ".woff", ".woff2"].indexOf(extname) >= 0) {
		res.header("Access-Control-Allow-Origin", "*");
	}

	// Prevents IE and Chrome from MIME-sniffing a response. Reduces exposure to
	// drive-by download attacks on sites serving user uploaded content.
	res.header("X-Content-Type-Options", "nosniff");

	// Prevent rendering of site within a frame.
	res.header("X-Frame-Options", "DENY");

	// Enable the XSS filter built into most recent web browsers. It's usually
	// enabled by default anyway, so role of this headers is to re-enable for this
	// particular website if it was disabled by the user.
	res.header("X-XSS-Protection", "1; mode=block");

	// Force IE to use latest rendering engine or Chrome Frame
	res.header("X-UA-Compatible", "IE=Edge,chrome=1");

	next();
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
