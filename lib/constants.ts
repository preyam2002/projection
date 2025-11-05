// Twitter's exact dimensions (for export)
// Official Twitter/X specs:
// - Header: 1503x500px (based on actual display measurements)
// - Profile: 335x335px (based on actual display measurements)
// - Profile position: 50.2509186351706px from left, 327.16476797658862px from top (exact pixel measurement from HTML)

export const TWITTER_BANNER_WIDTH = 1503;
export const TWITTER_BANNER_HEIGHT = 500;
export const TWITTER_PFP_SIZE = 335; // Based on actual Twitter display measurements
export const PROFILE_LEFT = 50.2509186351706; // Adjusted for correct banner width (1503px)
export const PROFILE_TOP = 327.16476797658862; // Exact pixel measurement from Twitter HTML (from banner top)
export const PROFILE_BORDER_THICKNESS = 15.050167224080267; // Border thickness in full-size pixels (measured from Twitter)

// Display dimensions (scaled down 50% for UI performance)
export const DISPLAY_WIDTH = 751; // Half of TWITTER_BANNER_WIDTH (1503/2 = 751.5, rounded)
export const DISPLAY_HEIGHT = 250;
export const DISPLAY_PFP_SIZE = 168; // Half of TWITTER_PFP_SIZE (335/2 = 167.5, rounded)
export const DISPLAY_SCALE = DISPLAY_WIDTH / TWITTER_BANNER_WIDTH;

