// https://gist.github.com/the-vampiire/a564af41ed0ce8eb7c30dbe6c0f627d8
const shapeFlags = flags =>
  flags.reduce((shapedFlags, flag) => {
    const [flagName, rawValue] = flag.split('=');
    // edge case where a cookie has a single flag and "; " split results in trailing ";"
    const value = rawValue ? rawValue.replace(';', '') : true;
    return { ...shapedFlags, [flagName]: value };
  }, {});

const extractCookies = headers => {
  const cookies = headers['set-cookie']; // Cookie[]

  return cookies.reduce((shapedCookies, cookieString) => {
    const [rawCookie, ...flags] = cookieString.split('; ');
    const [cookieName, value] = rawCookie.split('=');
    return { ...shapedCookies, [cookieName]: { value, flags: shapeFlags(flags) } };
  }, {});
};

module.exports = {
  shapeFlags,
  extractCookies,
};
