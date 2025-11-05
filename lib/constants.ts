// Twitter's exact dimensions (for export)
// Official Twitter/X specs:
// - Header: 1500x500px (3:1 aspect ratio)
// - Profile: 350x350px recommended (max size)
// - Profile position: 40px from left, overlaps header bottom by half

export const TWITTER_BANNER_WIDTH = 1500;
export const TWITTER_BANNER_HEIGHT = 500;
export const TWITTER_PFP_SIZE = 350; // 350x350 is recommended max
export const PROFILE_LEFT = 40; // 40px from left edge like Twitter
export const PROFILE_TOP = TWITTER_BANNER_HEIGHT - TWITTER_PFP_SIZE / 2; // 325px - PFP overlaps by 175px

// Display dimensions (scaled down 50% for UI performance)
export const DISPLAY_WIDTH = 750;
export const DISPLAY_HEIGHT = 250;
export const DISPLAY_PFP_SIZE = 175; // Display at 50% scale
export const DISPLAY_SCALE = DISPLAY_WIDTH / TWITTER_BANNER_WIDTH; // 0.5

