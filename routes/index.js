var express = require("express");
var router = express.Router();
var cors = require("cors");

router.get("/", function (req, res) {
	res.render("index", {
		title: "Share media easily",
	});
});

// router.get("/500", (req, res, next) => {
// 	next(new Error("Manually visited /500"));
// });

router.get("*", function (req, res) {
	res.status(404).render("error", {
		title: "404 Page Not Found - macu.mba",
		message: "404 Not Found",
	});
});

router.use(function (err, req, res, next) {
	console.error(err.stack);
	var code = typeof err.code === "number" ? err.code : 500;
	res.status(code).render("error", {
		title: "500 Internal Server Error - macu.mba",
		message: err.message || err,
	});
});

// WARNING: This is *NOT* a public endpoint. Do not depend on it in your router.
router.get(
	"/__rtcConfig__",
	cors({
		origin: function (origin, cb) {
			var allowed =
				CORS_WHITELIST.indexOf(origin) >= 0 ||
				/https?:\/\/localhost(:|$)/.test(origin) ||
				/https?:\/\/airtap\.local(:|$)/.test(origin);
			cb(null, allowed);
		},
	}),
	function (req, res) {
		// console.log('referer:', req.headers.referer, 'user-agent:', req.headers['user-agent'])
		var rtcConfig = {
			iceServers: [
				{
					urls: [
						"stun:stun.l.google.com:19302",
						"stun:global.stun.twilio.com:3478",
					],
				},
				{
					urls: [
						"turn:TODO:443?transport=udp",
						"turn:TODO:443?transport=tcp",
						"turns:TODO:443?transport=tcp",
					],
					username: "TODO",
					credential: "TODO",
				},
			],
			sdpSemantics: "unified-plan",
			bundlePolicy: "max-bundle",
			iceCandidatePoolsize: 1,
		};

		if (!rtcConfig) return res.status(404).send({ rtcConfig: {} });
		res.send({
			comment:
				"WARNING: This is *NOT* a public endpoint. Do not depend on it in your app",
			rtcConfig: rtcConfig,
		});
	}
);

module.exports = router;
