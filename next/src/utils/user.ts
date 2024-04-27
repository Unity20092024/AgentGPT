export const getAvatar = (user) => {
  if (!user) return null;

  const { name, email, image } = user;

  if (image) return image;

  const emailPart = email ? email : '';
  const namePart = name ? name.substr(0, 2).toUpperCase() : '';

  return `https://avatar.vercel.sh/${emailPart}.svg?text=${namePart}`;
};
