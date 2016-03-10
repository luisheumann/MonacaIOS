cordova.define('cordova/assets/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "assets/plugins/nl.x-services.plugins.socialsharing/www/SocialSharing.js",
        "id": "nl.x-services.plugins.socialsharing.SocialSharing",
        "clobbers": [
            "window.plugins.socialsharing"
        ]
    },
    {
        "file": "assets/plugins/com.teamnemitoff.phonedialer/www/dialer.js",
        "id": "com.teamnemitoff.phonedialer.phonedialer",
        "merges": [
            "phonedialer"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "nl.x-services.plugins.socialsharing": "4.3.16",
    "com.teamnemitoff.phonedialer": "0.3.0"
}
// BOTTOM OF METADATA
});