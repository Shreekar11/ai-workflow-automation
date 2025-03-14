export const generateRandomString = (length = 20): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = characters.length;
  let randomString = "sk_";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charLength));
  }

  return randomString;
};
