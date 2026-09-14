/** Shared gradient fills. Avoid `bg` shorthand — it can wipe `background-image`. */

export const filledGradient = (image: string) => ({
  borderWidth: '0px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  backgroundImage: image,
  backgroundOrigin: 'border-box',
  backgroundClip: 'border-box',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
});

export const outlineGradient = (image: string) => ({
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  backgroundImage: `linear-gradient({colors.background}, {colors.background}), ${image}`,
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  _light: {
    backgroundImage: `linear-gradient({colors.lightBackground}, {colors.lightBackground}), ${image}`,
  },
});
