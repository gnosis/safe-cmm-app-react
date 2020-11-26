import localforage from "localforage";

localforage.config({
  name: `cmm-app-${process.env.PKG_VERSION}`,
});

export default localforage;
