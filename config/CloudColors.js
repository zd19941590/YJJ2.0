"use strict";

/* Color Definitions
============================================================================= 
*/

const NAMED_COLORS = {
    // grayscale (light to dark)
    white: "rgba(255, 255, 255, 1)",
    bianca: "rgba(251, 249, 240, 1)",
    timberwolf: "rgba(218, 216, 210, 1)",
    magnesium: "rgba(178, 178, 178, 1)",
    black: "rgba(3, 3, 3, 1)",

    // blues (light to dark)
    iceberg: "rgba(216, 240, 246, 1)",
    coolGray: "rgba(136, 145, 181, 1)",
    blueBayoux: "rgba(101, 113, 135, 1)",
    facebookBlue: "rgba(66, 103, 178, 1)",
    blue: "rgba(29, 86, 251, 1)",
    palatinateBlue: "rgba(24, 76, 223, 1)",
    persianBlue: "rgba(23, 68, 200, 1)",
    sapphire: "rgba(10, 42, 102, 1)",
    sapphire2: "rgba(18, 36, 108, 1)",
    tangaroa: "rgba(1, 23, 65, 1)",
    blueCharcoal: "rgba(1, 10, 28, 1)",

    // the rest
    yellow: "rgba(246, 253, 55, 1)",
    green: "rgba(106, 246, 162, 1)",
    turquoise: "rgba(0, 205, 223, 1)",
    purple: "rgba(144, 63, 199, 1)",
    pink: "rgba(245, 64, 199, 1)",
    darkPink: "rgba(200, 40, 159, 1)",
    orange: "rgba(247, 144, 77, 1)",
    salmon: "rgba(243, 91, 89, 1)"
};

/// These colors named from fire-fox team.
/// For more information, click `https://design.firefox.com/photon/visuals/color.html`
const NAMED_ALPHA_COLORS = {
    magenta60: "#ed00b5",
    magenta70: "#b5007f",
    magenta80: "#7d004f",
    magenta90: "#440027",

    purple50: "#9400ff",
    purple60: "#8000d7",
    purple70: "#6200a4",
    purple80: "#440071",
    purple90: "#25003e",

    blue40: "#45a1ff",
    blue50: "#0a84ff",
    blue50A30: "#0a84ff4c",
    blue60: "#0060df",
    blue70: "#003eaa",
    blue80: "#002275",
    blue90: "#000f40",

    teal50: "#00feff",
    teal60: "#00c8d7",
    teal70: "#008ea4",
    teal80: "#005a71",
    teal90: "#002d3e",

    green50: "#30e60b",
    green60: "#12bc00",
    green70: "#058b00",
    green80: "#006504",
    green90: "#003706",

    yellow50: "#ffe900",
    yellow60: "#d7b600",
    yellow70: "#a47f00",
    yellow80: "#715100",
    yellow90: "#3e2800",

    red50: "#ff0039",
    red60: "#d70022",
    red70: "#a4000f",
    red80: "#5a0002",
    red90: "#3e0200",

    orange50: "#ff9400",
    orange60: "#d76e00",
    orange70: "#a44900",
    orange80: "#712b00",
    orange90: "#3e1300",

    grey10: "#f9f9fa",
    grey10A10: "#f9f9fa19",
    grey10A20: "#f9f9fa33",
    grey10A40: "#f9f9fa66",
    grey10A60: "#f9f9fa99",
    grey10A80: "#f9f9facc",
    grey20: "#ededf0",
    grey30: "#d7d7db",
    grey40: "#b1b1b3",
    grey50: "#737373",
    grey60: "#4a4a4f",
    grey70: "#38383d",
    grey80: "#2a2a2e",
    grey90: "#0c0c0d",
    grey90A05: "#0c0c0d0c",
    grey90A10: "#0c0c0d19",
    grey90A20: "#0c0c0d33",
    grey90A30: "#0c0c0d4c",
    grey90A40: "#0c0c0d66",
    grey90A50: "#0c0c0d7f",
    grey90A60: "#0c0c0d99",
    grey90A70: "#0c0c0db2",
    grey90A80: "#0c0c0dcc",
    grey90A90: "#0c0c0de5",

    ink70: "#363959",
    ink80: "#202340",
    ink90: "#0f1126",

    white100: "#ffffff",
}

const THEME_COLORS = {
    // pass through for use with colorWithAlpha
    ...NAMED_COLORS,

    // alias the named colors by use-case
    actionText: NAMED_COLORS.blue,
    lightBackground: NAMED_COLORS.bianca,
    darkBackground: NAMED_COLORS.blueCharcoal,
    darkText: NAMED_COLORS.blueCharcoal,
    cellBorder: NAMED_COLORS.blueCharcoal,
    lightText: NAMED_COLORS.blueBayoux,

    // legacy
    inactiveText: "#9B9B9B"
};

const LOCATION_COLORS = {
    "220A": NAMED_COLORS.sapphire2,
    "220B": NAMED_COLORS.purple,
    "220C": NAMED_COLORS.blue,
    "210F": NAMED_COLORS.turquoise,
    "210G": NAMED_COLORS.turquoise,
    LL20: NAMED_COLORS.green,
    REGISTRATION: NAMED_COLORS.tangaroa,
    REGISTRATIONDESK: NAMED_COLORS.tangaroa,
    FESTIVALHALL: NAMED_COLORS.sapphire2,
    CITYNATIONALCIVIC: NAMED_COLORS.pink,

    A: NAMED_COLORS.sapphire2,
    B: NAMED_COLORS.purple,
    C: NAMED_COLORS.blue,
    F: NAMED_COLORS.turquoise,
    G: NAMED_COLORS.turquoise,
    LL: NAMED_COLORS.green
};

/* Exports
=============================================================================
*/

module.exports = {
    ...THEME_COLORS, // pass through all theme colors (named and by-purpose)

    colorWithAlpha(name: string = "blue", opacity: number = 1) {
        if (!THEME_COLORS[name]) {
            name = "blue";
        }
        return THEME_COLORS[name].split(", 1)").join(`, ${opacity})`);
    },

    colorWithName(name: string = "blue") {
        if (!NAMED_ALPHA_COLORS[name]) {
            name = "blue";
        }
        return NAMED_ALPHA_COLORS[name];
    },

    colorForLocation(location: ?string): string {
        if (!location) {
            return NAMED_COLORS.tangaroa;
        }
        let color = LOCATION_COLORS[location.replace(/ /g, "").toUpperCase()];
        if (!color) {
            color = NAMED_COLORS.tangaroa;
        }
        return color;
    },

    colorForTopic(count: number, index: number): string {
        const hue = Math.round(360 * index / (count + 1));
        return `hsl(${hue}, 74%, 65%)`;
    }
};
