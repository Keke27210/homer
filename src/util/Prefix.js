class Prefix {
constructor(){
 throw new Error("This class may not be initiated with new");
}

  static regExpEsc(str) {
      return str.replace(Prefix.REGEXPESC, "\\$&");
    }
}
Prefix.REGEXPESC = /[-/\\^$*+?.()|[\]{}]/g;
