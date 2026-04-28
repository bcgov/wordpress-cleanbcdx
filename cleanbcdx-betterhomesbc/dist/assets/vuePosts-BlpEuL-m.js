/**
* @vue/shared v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
const toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
};
/**
* @vue/reactivity v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this.__v_skip = true;
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].resume();
          }
        }
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      activeEffectScope = this.prevScope;
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope && activeEffectScope.active) {
      activeEffectScope.effects.push(this);
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l = computed2.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = /* @__PURE__ */ toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = /* @__PURE__ */ toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
    args[0] = /* @__PURE__ */ toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = /* @__PURE__ */ toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (/* @__PURE__ */ isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
      if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
        oldValue = /* @__PURE__ */ toRaw(oldValue);
        value = /* @__PURE__ */ toRaw(value);
      }
      if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (target === /* @__PURE__ */ toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = /* @__PURE__ */ toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = /* @__PURE__ */ toRaw(this);
        const proto = getProto(target);
        const rawValue = /* @__PURE__ */ toRaw(value);
        const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          value = /* @__PURE__ */ toRaw(value);
        }
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = /* @__PURE__ */ toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
    newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (/* @__PURE__ */ isRef(source)) {
    getter = () => source.value;
    forceTrigger = /* @__PURE__ */ isShallow(source);
  } else if (/* @__PURE__ */ isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
    getter = () => source.map((s) => {
      if (/* @__PURE__ */ isRef(s)) {
        return s.value;
      } else if (/* @__PURE__ */ isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect2.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect2);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      watchHandle();
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect2;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect2.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (/* @__PURE__ */ isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
/**
* @vue/runtime-core v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (/* @__PURE__ */ isRef(value)) {
    value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = /* @__PURE__ */ toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watchEffect(effect2, options) {
  return doWatch(effect2, null, options);
}
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
const enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
const recursiveGetSubtree = (instance) => {
  const subTree = instance.subTree;
  return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
};
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      const child = findNonCommentChild(children);
      const rawProps = /* @__PURE__ */ toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getInnerChild$1(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      let enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance,
        // #11061, ensure enterHooks is fresh after clone
        (hooks) => enterHooks = hooks
      );
      if (innerChild.type !== Comment) {
        setTransitionHooks(innerChild, enterHooks);
      }
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
        let leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 8)) {
              instance.update();
            }
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
            enterHooks.delayedLeave = () => {
              delayedLeave();
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
          };
        } else {
          oldInnerChild = void 0;
        }
      } else if (oldInnerChild) {
        oldInnerChild = void 0;
      }
      return child;
    };
  }
};
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      if (leavingVNodesCache[key] === vnode) return;
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      el[enterCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey] = void 0;
      };
      const done = el[enterCbKey].bind(null, false);
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el[enterCbKey]) {
        el[enterCbKey](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      const done = el[leaveCbKey].bind(null, false);
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      const hooks2 = resolveTransitionHooks(
        vnode2,
        props,
        state,
        instance,
        postClone
      );
      if (postClone) postClone(hooks2);
      return hooks2;
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = /* @__PURE__ */ toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref22, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (/* @__PURE__ */ isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref3);
    const _isRef = /* @__PURE__ */ isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef() || !rawRef.k ? ref3.value : refs[rawRef.k];
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref3, rawRef.k)) {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref3, rawRef.k)) {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !/* @__PURE__ */ isShallow(source);
      isReadonlySource = /* @__PURE__ */ isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data)) ;
    else {
      instance.data = /* @__PURE__ */ reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (/* @__PURE__ */ isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false) ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return /* @__PURE__ */ shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    setTransitionHooks(root, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = /* @__PURE__ */ toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing = false;
  const render = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs(instance);
      flushPostFlushCbs();
      isFlushing = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString(ref3) || /* @__PURE__ */ isRef(ref3) || isFunction(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (/* @__PURE__ */ isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}
const version = "3.5.32";
/**
* @vue/runtime-dom v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const decorate$1 = (t) => {
  t.displayName = "Transition";
  t.props = TransitionPropsValidators;
  return t;
};
const Transition = /* @__PURE__ */ decorate$1(
  (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)
);
const callHook = (hook, args = []) => {
  if (isArray(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = (el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve);
        }
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve);
        }
      });
      callHook(onLeave, [el, resolve]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve();
    }
  };
  if (explicitTimeout != null) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
  const targetDocument = el ? el.ownerDocument : document;
  return targetDocument.body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      setStyle(style, key, next[key]);
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      5,
      [e]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map(
      (fn) => (e2) => !e2._stopped && fn && fn(e2)
    );
  } else {
    return value;
  }
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const vModelCheckbox = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign = el[assignKey];
      if (isArray(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign(cloned);
      } else {
        assign(getCheckboxValue(el, checked));
      }
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  let checked;
  if (isArray(value)) {
    checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    checked = value.has(vnode.props.value);
  } else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) {
    el.checked = checked;
  }
}
const vModelSelect = {
  // <select multiple> value need to be deep traversed
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue(o)) : getValue(o)
      );
      el[assignKey](
        el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]
      );
      el._assigning = true;
      nextTick(() => {
        el._assigning = false;
      });
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    if (!el._assigning) {
      setSelected(el, value);
    }
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  const isArrayValue = isArray(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArrayValue) {
        const optionType = typeof optionValue;
        if (optionType === "string" || optionType === "number") {
          option.selected = value.some((v) => String(v) === String(optionValue));
        } else {
          option.selected = looseIndexOf(value, optionValue) > -1;
        }
      } else {
        option.selected = value.has(optionValue);
      }
    } else if (looseEqual(getValue(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  }));
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  const cache = fn._withKeys || (fn._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some(
      (k) => k === eventKey || keyNames[k] === eventKey
    )) {
      return fn(event);
    }
  }));
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  const doc2 = parser.parseFromString(text, "text/html");
  return doc2.documentElement.textContent;
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function trackProviderFilterChange({
  filterName,
  upgradeType,
  program,
  location,
  label
}) {
  window.snowplow("trackSelfDescribingEvent", {
    schema: "iglu:ca.bc.gov.cleanbc/providers/jsonschema/1-0-0",
    data: {
      action: "change",
      element_type: `${filterName}-filter`,
      upgrade_type: upgradeType,
      program,
      service_location: location,
      label
    }
  });
}
function trackProviderClick({
  filterName,
  upgradeType,
  program,
  location,
  companyName,
  destination
}) {
  window.snowplow("trackSelfDescribingEvent", {
    schema: "iglu:ca.bc.gov.cleanbc/providers/jsonschema/1-0-0",
    data: {
      action: "click",
      element_type: `${filterName}-link`,
      upgrade_type: upgradeType,
      program,
      service_location: location,
      label: companyName,
      destination
    }
  });
}
const localAnalyticsReady = () => {
  var _a, _b;
  const isServerEnv = (_a = window.site) == null ? void 0 : _a.domain.includes("bc.ca");
  const isLocalEnv = (_b = window.site) == null ? void 0 : _b.domain.includes(".local");
  if (!isServerEnv || isLocalEnv) {
    (function(p2, l, o, w, i, n, g) {
      if (!p2[i]) {
        p2.GlobalSnowplowNamespace = p2.GlobalSnowplowNamespace || [];
        p2.GlobalSnowplowNamespace.push(i);
        p2[i] = function() {
          (p2[i].q = p2[i].q || []).push(arguments);
        };
        p2[i].q = p2[i].q || [];
        n = l.createElement(o);
        g = l.getElementsByTagName(o)[0];
        n.async = 1;
        n.src = w;
        g.parentNode.insertBefore(n, g);
      }
    })(window, document, "script", "https://www2.gov.bc.ca/StaticWebResources/static/sp/sp-2-14-0.js", "snowplow");
    const collector = "spt.apps.gov.bc.ca";
    window.snowplow("newTracker", "rt", collector, {
      appId: "Snowplow_standalone",
      cookieLifetime: 86400 * 548,
      platform: "web",
      post: true,
      forceSecureTracker: true,
      contexts: {
        webPage: true,
        performanceTiming: true
      }
    });
    window.snowplow("enableActivityTracking", 30, 30);
    window.snowplow("enableLinkClickTracking");
    window.snowplow("trackPageView");
  }
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$2 = { class: "inner" };
const _hoisted_2$2 = {
  key: 0,
  id: "pqeasFilterControls",
  class: "pqeasFilterControls filter-container"
};
const _hoisted_3$2 = { class: "filter-controls-container" };
const _hoisted_4$1 = {
  key: 0,
  class: "control type-input location-input-control"
};
const _hoisted_5$1 = { class: "custom-input location-input-wrapper" };
const _hoisted_6$1 = ["list", "aria-invalid", "aria-describedby"];
const _hoisted_7$2 = {
  key: 0,
  id: "locationList"
};
const _hoisted_8$2 = ["value"];
const _hoisted_9$2 = {
  key: 1,
  id: "locationListMobile"
};
const _hoisted_10$2 = {
  key: 0,
  value: "Please type to find your community"
};
const _hoisted_11$2 = ["value"];
const _hoisted_12$2 = {
  key: 2,
  id: "locationError",
  class: "message error-message",
  role: "alert"
};
const _hoisted_13$2 = {
  key: 1,
  class: "control type-input"
};
const _hoisted_14$2 = { class: "custom-input" };
const _hoisted_15$2 = {
  key: 2,
  class: "control type-select"
};
const _hoisted_16$2 = { class: "custom-select" };
const _hoisted_17$2 = {
  key: 0,
  class: "control reset-filters"
};
const _hoisted_18$2 = {
  class: "totals",
  "aria-live": "polite"
};
const _hoisted_19$2 = { class: "control copy-link-btn" };
const _hoisted_20$2 = ["onKeydown", "disabled"];
const _hoisted_21$2 = ["onKeydown"];
const _hoisted_24$2 = {
  id: "pqeasResults",
  class: "pqeasResults results table table--striped"
};
const _hoisted_25$1 = {
  key: 0,
  class: "no-results"
};
const _hoisted_26$2 = {
  key: 1,
  class: "is-loading",
  role: "status",
  "aria-live": "polite"
};
const _hoisted_27$2 = {
  "data-label": "Company name and head office location",
  class: "pqea__company-and-location"
};
const _hoisted_28$2 = { class: "table-link-wrapper" };
const _hoisted_29$2 = ["href", "onClick", "aria-label"];
const _hoisted_30$2 = {
  key: 1,
  class: "pqea__company contractor__company"
};
const _hoisted_31$2 = { class: "has-icon location pqea__location" };
const _hoisted_32$2 = {
  "data-label": "Energy Advisor",
  class: "pqea__contact-name"
};
const _hoisted_33$2 = {
  "data-label": "Email and phone",
  class: "pqea__email-and-phone"
};
const _hoisted_34$2 = { class: "table-link-wrapper" };
const _hoisted_35$2 = ["href", "onClick"];
const _hoisted_36$2 = ["innerHTML"];
const _hoisted_37$2 = {
  key: 1,
  class: "pqea__email"
};
const _hoisted_38$2 = ["href", "onClick"];
const _hoisted_39$2 = {
  key: 3,
  class: "pqea__telephone"
};
const _hoisted_40$2 = {
  key: 1,
  class: "pqeasFilterControls filter-container filter-container--bottom"
};
const _hoisted_41$2 = { class: "control load-more" };
const _hoisted_42$2 = { class: "totals" };
const MOBILE_HINT_EMPTY$1 = "Please type to find your community";
const MOBILE_HINT_MORE$1 = "Continue typing to see more results";
const PREFERRED_SETTINGS_KEY$2 = "preferredSettings";
const RENOVATIONS_CATEGORY_LABEL = "Renovating a home";
const CONSTRUCTION_CATEGORY_LABEL = "Constructing a home";
const _sfc_main$2 = {
  __name: "pqeaVueApp",
  setup(__props) {
    var _a;
    function debounce(fn, delay = 500) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }
    const normalize = (s = "") => decodeHtmlEntities(String(s)).trim().toLowerCase();
    const includesFuzzy = (haystack = "", needle = "") => {
      const h2 = normalize(haystack);
      const n = String(needle).trim().toLowerCase();
      if (!n) return true;
      return h2.includes(n);
    };
    function findClosestLocation(raw, locationList) {
      const q = normalize(raw);
      if (q === normalize(MOBILE_HINT_EMPTY$1) || q === normalize(MOBILE_HINT_MORE$1)) {
        return { match: "all", reason: "empty" };
      }
      if (!q) return { match: "all", reason: "empty" };
      if (q === "all" || q === "all locations") return { match: "all", reason: "all" };
      const list = (locationList || []).filter(Boolean);
      const exact = list.find((loc) => normalize(loc) === q);
      if (exact) return { match: exact, reason: "exact" };
      const starts = list.filter((loc) => normalize(loc).startsWith(q)).slice(0, 10);
      if (starts.length === 1) return { match: starts[0], reason: "startsWith" };
      if (starts.length > 1) return { match: null, reason: "ambiguous_starts", candidates: starts };
      const includes = list.map((loc) => ({ loc, idx: normalize(loc).indexOf(q) })).filter((x) => x.idx >= 0).sort((a, b) => a.idx - b.idx || a.loc.length - b.loc.length || a.loc.localeCompare(b.loc)).map((x) => x.loc).slice(0, 10);
      if (includes.length === 1) return { match: includes[0], reason: "includes" };
      if (includes.length > 1) return { match: null, reason: "ambiguous_includes", candidates: includes };
      return { match: null, reason: "none" };
    }
    const isShareSourceUrl = () => new URLSearchParams(window.location.search).get("source") === "share";
    function readPreferredSettings() {
      if (isShareSourceUrl()) return null;
      try {
        const raw = localStorage.getItem(PREFERRED_SETTINGS_KEY$2);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    }
    const resolvePreferredLocation = () => {
      const preferred = readPreferredSettings();
      const loc = preferred == null ? void 0 : preferred.location;
      if (!loc) return null;
      const candidates = [loc.name, loc.slug, loc.region, loc.region_slug].map((value) => value ? String(value).trim() : "").filter(Boolean);
      if (!candidates.length) return null;
      const list = locations.value || [];
      for (const candidate of candidates) {
        const { match } = findClosestLocation(candidate, list);
        if (match && match !== "all") return match;
      }
      return null;
    };
    const loadMoreBtn = /* @__PURE__ */ ref(null);
    const resultsTbody = /* @__PURE__ */ ref(null);
    const pqeas = /* @__PURE__ */ ref([]);
    const shuffledPqeas = /* @__PURE__ */ ref([]);
    const isVisible = /* @__PURE__ */ ref(true);
    const showLoadingMessage = /* @__PURE__ */ ref(true);
    const isLoading = /* @__PURE__ */ ref(false);
    const nameQuery = /* @__PURE__ */ ref("");
    const defaultSelectedLocation = /* @__PURE__ */ ref("all");
    const selectedLocation = /* @__PURE__ */ ref("all");
    const defaultPostType = /* @__PURE__ */ ref("pqeas-renovation");
    const selectedPostType = /* @__PURE__ */ ref(defaultPostType.value);
    const pageSize = /* @__PURE__ */ ref(30);
    const visibleCount = /* @__PURE__ */ ref(pageSize.value);
    const isMobile = /* @__PURE__ */ ref(false);
    const isLocationFocused = /* @__PURE__ */ ref(false);
    const locationInputValue = /* @__PURE__ */ ref("");
    const locationInputDisplay = /* @__PURE__ */ ref("");
    const locationTouched = /* @__PURE__ */ ref(false);
    const locationError = /* @__PURE__ */ ref("");
    onMounted(() => {
      isMobile.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    });
    watch(locationInputValue, (v) => {
      if (isMobile.value) locationInputDisplay.value = v || "";
    });
    const locationInputProxy = computed({
      get() {
        return isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      },
      set(val) {
        if (isMobile.value) locationInputDisplay.value = val;
        else locationInputValue.value = val;
      }
    });
    function handleLocationFocus() {
      isLocationFocused.value = true;
      if (isMobile.value) {
        setTimeout(() => {
          var _a2;
          (_a2 = document.querySelector("#pqeaLocation")) == null ? void 0 : _a2.focus();
        }, 300);
      }
    }
    const commitLocation = (trigger2 = "change") => {
      const el = document.querySelector("#pqeaLocation");
      locationTouched.value = true;
      if (isMobile.value && trigger2 === "blur") {
        if (el) locationInputDisplay.value = el.value;
      }
      const raw = (isMobile.value ? locationInputDisplay.value : locationInputValue.value) || "";
      const list = locations.value || [];
      const { match, reason, candidates = [] } = findClosestLocation(raw, list);
      if (!raw.trim()) {
        selectedLocation.value = "all";
        locationInputValue.value = "";
        locationInputDisplay.value = "";
        locationError.value = "";
        isLocationFocused.value = false;
        return;
      }
      if (match) {
        selectedLocation.value = match;
        locationError.value = "";
        locationInputValue.value = match === "all" ? "" : match;
        locationInputDisplay.value = match === "all" ? "" : match;
      } else {
        selectedLocation.value = "all";
        const example = candidates.slice(0, 3).join(", ");
        locationError.value = reason.startsWith("ambiguous") ? `That matches multiple service regions. Please choose one from the list (e.g., ${example}${candidates.length > 3 ? "…" : ""}).` : "That service region was not recognized. Please choose one from the list of available options.";
      }
      isLocationFocused.value = false;
    };
    const locationQuery = computed(() => {
      const raw = isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      return normalize(raw || "");
    });
    const locationQueryIsEmpty = computed(() => !locationQuery.value);
    const hasValidLocationSelection = computed(
      () => selectedLocation.value !== "all" && !locationError.value && locations.value.includes(selectedLocation.value)
    );
    function clearLocationSelection() {
      selectedLocation.value = "all";
      locationInputValue.value = "";
      locationInputDisplay.value = "";
      locationTouched.value = false;
      locationError.value = "";
      isLocationFocused.value = true;
      nextTick(() => {
        var _a2;
        (_a2 = document.querySelector("#pqeaLocation")) == null ? void 0 : _a2.focus();
      });
    }
    const mobileLocationOptions = computed(() => {
      const list = locations.value || [];
      const q = locationQuery.value;
      if (!q) return [];
      const starts = [];
      const includes = [];
      for (const loc of list) {
        const n = normalize(loc);
        if (n.startsWith(q)) starts.push(loc);
        else if (n.includes(q)) includes.push(loc);
        if (starts.length >= 10) break;
      }
      if (starts.length < 10) {
        for (const loc of includes) {
          starts.push(loc);
          if (starts.length >= 10) break;
        }
      }
      return starts.slice(0, 10);
    });
    const publicDomain = /* @__PURE__ */ ref("https://betterhomes.gov.bc.ca");
    const pqeasAPI = `${((_a = window.site) == null ? void 0 : _a.domain) ? window.site.domain : publicDomain.value}/wp-json/custom/v1/pqeas`;
    const itemsToClearFromSessionStorage = /* @__PURE__ */ ref([
      "contractorsData",
      "contractorsTimestamp",
      "faqsData",
      "faqsTimestamp",
      "rebatesData",
      "rebatesTimestamp"
    ]);
    const isQuotaExceededError = (error) => {
      if (!error) return false;
      return error.code === 22 || error.code === 1014 || error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED";
    };
    const isDataValid = (timestamp) => {
      const timeElapsed = Date.now() - parseInt(String(timestamp), 10);
      const hoursElapsed = timeElapsed / (1e3 * 60 * 60);
      return hoursElapsed < 24;
    };
    const fetchData = async () => {
      try {
        isLoading.value = true;
        showLoadingMessage.value = true;
        let data = sessionStorage.getItem("pqeasData");
        let timestamp = sessionStorage.getItem("pqeasTimestamp");
        let cachedData = null;
        if (data && timestamp && isDataValid(timestamp)) {
          cachedData = JSON.parse(data);
        } else if (!isShareSourceUrl()) {
          data = localStorage.getItem("pqeasData");
          timestamp = localStorage.getItem("pqeasTimestamp");
          if (data && timestamp && isDataValid(timestamp)) {
            cachedData = JSON.parse(data);
          }
        }
        if (cachedData) {
          pqeas.value = cachedData;
          shuffledPqeas.value = shuffleArray([...cachedData]);
          showLoadingMessage.value = false;
          isLoading.value = false;
          return;
        }
        const response = await fetch(pqeasAPI, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const json = await response.json();
        try {
          itemsToClearFromSessionStorage.value.forEach((item) => sessionStorage.removeItem(item));
          sessionStorage.clear();
        } catch (clearError) {
          console.warn("Error clearing sessionStorage:", clearError);
        }
        try {
          sessionStorage.setItem("pqeasData", JSON.stringify(json));
          sessionStorage.setItem("pqeasTimestamp", Date.now().toString());
        } catch (storageError) {
          if (isQuotaExceededError(storageError)) {
            console.warn("SessionStorage quota exceeded. Falling back to localStorage.");
            if (!isShareSourceUrl()) {
              try {
                localStorage.setItem("pqeasData", JSON.stringify(json));
                localStorage.setItem("pqeasTimestamp", Date.now().toString());
              } catch (lsError) {
                console.error("Error setting data in localStorage:", lsError);
              }
            }
          } else {
            console.error("Error setting data in sessionStorage:", storageError);
            throw storageError;
          }
        }
        pqeas.value = json;
        shuffledPqeas.value = shuffleArray([...json]);
        showLoadingMessage.value = false;
        isLoading.value = false;
      } catch (error) {
        console.error("Error fetching pqeas data:", error);
        throw error;
      }
    };
    const locations = computed(() => {
      const unique = /* @__PURE__ */ new Set();
      pqeas.value.forEach((pqea) => {
        const locs = pqea == null ? void 0 : pqea.locations;
        if (!locs) return;
        if (typeof locs === "string") unique.add(locs == null ? void 0 : locs.name);
        else if (Array.isArray(locs)) locs.forEach((l) => unique.add(l == null ? void 0 : l.name));
      });
      return Array.from(unique).filter(Boolean).sort((a, b) => a.localeCompare(b));
    });
    const normalizePostTypeFromItem = (item) => {
      const direct = String((item == null ? void 0 : item.post_type) || "").trim().toLowerCase();
      if (direct === "pqeas-renovation" || direct === "pqeas-construction") return direct;
      const categories = item == null ? void 0 : item.categories;
      if (typeof categories === "string") {
        const c = categories.toLowerCase();
        if (c === RENOVATIONS_CATEGORY_LABEL.toLowerCase()) return "pqeas-renovation";
        if (c === CONSTRUCTION_CATEGORY_LABEL.toLowerCase()) return "pqeas-construction";
      }
      if (Array.isArray(categories)) {
        for (const c of categories) {
          const name = typeof c === "string" ? c : c == null ? void 0 : c.name;
          const n = String(name || "").toLowerCase();
          if (n === RENOVATIONS_CATEGORY_LABEL.toLowerCase()) return "pqeas-renovation";
          if (n === CONSTRUCTION_CATEGORY_LABEL.toLowerCase()) return "pqeas-construction";
        }
      }
      return "";
    };
    const filteredPqeas = computed(() => {
      let results = [...shuffledPqeas.value || []];
      if (selectedPostType.value) {
        results = results.filter((p2) => normalizePostTypeFromItem(p2) === selectedPostType.value);
      }
      if (nameQuery.value) {
        results = results.filter((p2) => {
          var _a2;
          return includesFuzzy((_a2 = p2 == null ? void 0 : p2.details) == null ? void 0 : _a2.company_name, nameQuery.value);
        });
      }
      if (selectedLocation.value !== "all") {
        results = results.filter(
          (p2) => Array.isArray(p2.locations) && p2.locations.some((l) => (l == null ? void 0 : l.name) === selectedLocation.value)
        );
      }
      return results;
    });
    const displayedPqeas = computed(() => filteredPqeas.value.slice(0, visibleCount.value));
    const remainingCount = computed(() => Math.max(0, filteredPqeas.value.length - displayedPqeas.value.length));
    const nextLoadCount = computed(() => Math.min(pageSize.value, remainingCount.value));
    const focusFirstNewLink = async (startIndex) => {
      var _a2, _b;
      await nextTick();
      const tbody = resultsTbody.value;
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr.pqea");
      for (let i = startIndex; i < rows.length; i++) {
        const link = rows[i].querySelector('a[href]:not([tabindex="-1"])');
        if (link) {
          link.focus({ preventScroll: true });
          link.scrollIntoView({ block: "center" });
          return;
        }
      }
      (_b = (_a2 = loadMoreBtn.value) == null ? void 0 : _a2.focus) == null ? void 0 : _b.call(_a2);
    };
    const loadMore = async () => {
      const startIndex = displayedPqeas.value.length;
      visibleCount.value = Math.min(visibleCount.value + pageSize.value, filteredPqeas.value.length);
      await focusFirstNewLink(startIndex);
    };
    const assembleUrl = ({ includeSource = false } = {}) => {
      var _a2;
      const baseUrl = window.location.origin + window.location.pathname;
      const url = new URL(baseUrl);
      url.searchParams.set("tool", "pqeas");
      if (includeSource) {
        url.searchParams.set("source", "share");
      }
      if (selectedPostType.value && selectedPostType.value !== defaultPostType.value) {
        url.searchParams.set("pqea_type", selectedPostType.value);
      }
      if ((_a2 = nameQuery.value) == null ? void 0 : _a2.trim()) {
        url.searchParams.set("company", nameQuery.value.trim());
      }
      if (selectedLocation.value && selectedLocation.value !== "all") {
        url.searchParams.set("region", selectedLocation.value);
      }
      return url.toString();
    };
    function handleLinkCopiedMessageContent(event, target = ".filter-container", msg) {
      var _a2, _b, _c;
      const root = ((_b = (_a2 = event == null ? void 0 : event.target) == null ? void 0 : _a2.closest) == null ? void 0 : _b.call(_a2, target)) || document.querySelector(target) || document.body;
      const el = (_c = root == null ? void 0 : root.querySelector) == null ? void 0 : _c.call(root, ".copy-message");
      if (!el) return;
      el.textContent = msg;
      el.classList.remove("isFadedOut");
      setTimeout(() => el.classList.add("isFadedOut"), 1e3);
      setTimeout(() => {
        if (el.classList.contains("isFadedOut")) el.textContent = "";
      }, 1600);
    }
    async function copyTextToClipboard(text) {
      var _a2;
      if ((_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      } finally {
        document.body.removeChild(ta);
      }
      return ok;
    }
    const addLinkToClipboard = async (event) => {
      const url = assembleUrl({ includeSource: true });
      try {
        const ok = await copyTextToClipboard(url);
        handleLinkCopiedMessageContent(event, ".filter-container", ok ? "Shareable link copied to clipboard!" : "Copy failed");
      } catch (err) {
        console.error("Failed to copy URL:", err);
        handleLinkCopiedMessageContent(event, ".filter-container", "Copy failed");
      }
    };
    const insertBreakableChar = (email) => String(email || "").replace(/@/g, "&#8203;@").replace(/\./g, "&#8203;.");
    const onProviderLinkClick = (pqea) => {
      var _a2, _b;
      trackProviderClick({
        filterName: "pqea",
        upgradeType: "",
        // retained schema field, not used here
        location: selectedLocation.value,
        companyName: ((_a2 = pqea == null ? void 0 : pqea.details) == null ? void 0 : _a2.company_name) || "",
        destination: ((_b = pqea == null ? void 0 : pqea.details) == null ? void 0 : _b.company_website) || ""
      });
    };
    const onEmailPhoneClick = (pqea, linkType) => {
      var _a2, _b, _c, _d, _e, _f;
      let destination = "";
      if (linkType === "email") {
        ((_a2 = pqea == null ? void 0 : pqea.details) == null ? void 0 : _a2.email) ? `Email: ${pqea.details.email}` : "Email link";
        destination = `mailto:${((_b = pqea == null ? void 0 : pqea.details) == null ? void 0 : _b.email) || ""}`;
      } else {
        ((_c = pqea == null ? void 0 : pqea.details) == null ? void 0 : _c.phone) ? `Phone: ${pqea.details.phone}` : "Phone link";
        destination = `tel:+1${((_e = (_d = pqea == null ? void 0 : pqea.details) == null ? void 0 : _d.phone) == null ? void 0 : _e.replace(/-/g, "")) || ""}`;
      }
      trackProviderClick({
        filterName: "pqea",
        upgradeType: "",
        location: selectedLocation.value,
        companyName: ((_f = pqea == null ? void 0 : pqea.details) == null ? void 0 : _f.company_name) || "",
        destination
      });
    };
    const clearFilters = () => {
      nameQuery.value = "";
      selectedPostType.value = defaultPostType.value;
      selectedLocation.value = defaultSelectedLocation.value;
      locationInputValue.value = "";
      locationInputDisplay.value = "";
      locationTouched.value = false;
      locationError.value = "";
      isLocationFocused.value = false;
      window.history.replaceState({}, "", assembleUrl());
      visibleCount.value = pageSize.value;
    };
    watch(selectedLocation, (newVal, oldVal) => {
      if (newVal === oldVal) return;
      if (isLocationFocused.value) return;
      locationInputValue.value = newVal === "all" ? "" : newVal;
      if (newVal === "all" || locations.value.includes(newVal)) {
        locationError.value = "";
        locationTouched.value = false;
      }
      trackProviderFilterChange({
        filterName: "pqea",
        upgradeType: "",
        location: newVal,
        label: `Location changed to: ${newVal}`
      });
    });
    watch(nameQuery, (newVal, oldVal) => {
      if (newVal === oldVal) return;
      trackProviderFilterChange({
        filterName: "pqea",
        upgradeType: "",
        location: selectedLocation.value,
        label: `Name changed to: ${newVal || "(blank)"}`
      });
    });
    watch(selectedPostType, (newVal, oldVal) => {
      if (newVal === oldVal) return;
      trackProviderFilterChange({
        filterName: "pqea",
        upgradeType: "",
        location: selectedLocation.value,
        label: `Post type changed to: ${newVal}`
      });
    });
    watch([selectedLocation, nameQuery, selectedPostType], () => {
      visibleCount.value = pageSize.value;
    });
    watch(() => {
      var _a2;
      return (_a2 = window.site) == null ? void 0 : _a2.domain;
    }, (newVal) => {
      if (newVal) fetchData();
    });
    onMounted(() => {
      localAnalyticsReady();
      const appElement = document.getElementById("pqeaFilterApp");
      const showControls = (appElement == null ? void 0 : appElement.getAttribute("data-show-controls")) === "false";
      isVisible.value = showControls;
      fetchData();
      showLoadingMessage.value = true;
    });
    watchEffect(() => {
      if (!locations.value.length) return;
      const urlParams = new URLSearchParams(window.location.search);
      const showParam = urlParams.get("show");
      if (urlParams.get("tool") !== null && urlParams.get("tool") !== "pqeas") {
        console.warn('Tool parameter does not match "pqeas". Initialization skipped.');
        return;
      }
      if (showParam === "off") isVisible.value = false;
      const serviceRegion = urlParams.get("region");
      if (serviceRegion) {
        const decoded = decodeURIComponent(serviceRegion);
        if (locations.value.includes(decoded)) {
          selectedLocation.value = decoded;
          locationInputValue.value = decoded;
          locationError.value = "";
          locationTouched.value = false;
        } else {
          selectedLocation.value = "all";
          locationInputValue.value = decoded;
          locationError.value = "That service region was not recognized. Please choose one from the list of available options.";
          locationTouched.value = true;
        }
      }
      showLoadingMessage.value = false;
    });
    const didHydrateFromUrl = /* @__PURE__ */ ref(false);
    function hydrateFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const showParam = urlParams.get("show");
      if (showParam === "off") isVisible.value = false;
      const toolParam = urlParams.get("tool");
      if (toolParam !== null && toolParam !== "pqeas") {
        console.warn('Tool parameter does not match "pqeas". Initialization skipped.');
        return;
      }
      const company = urlParams.get("company");
      nameQuery.value = (company == null ? void 0 : company.trim()) ? company.trim() : "";
      const postTypeParam = urlParams.get("pqea_type");
      const allowedPostTypes = ["pqeas-renovation", "pqeas-construction"];
      selectedPostType.value = allowedPostTypes.includes(postTypeParam) ? postTypeParam : defaultPostType.value;
      const serviceRegion = urlParams.get("region");
      if (serviceRegion) {
        if (locations.value.includes(serviceRegion)) {
          selectedLocation.value = serviceRegion;
          locationInputValue.value = serviceRegion;
          locationInputDisplay.value = serviceRegion;
          locationError.value = "";
          locationTouched.value = false;
        } else {
          selectedLocation.value = "all";
          locationInputValue.value = serviceRegion;
          locationInputDisplay.value = serviceRegion;
          locationError.value = "That service region was not recognized. Please choose one from the list of available options.";
          locationTouched.value = true;
        }
      } else if (!isShareSourceUrl()) {
        const preferredLocation = resolvePreferredLocation();
        if (preferredLocation) {
          selectedLocation.value = preferredLocation;
          locationInputValue.value = preferredLocation;
          locationInputDisplay.value = preferredLocation;
          locationError.value = "";
          locationTouched.value = false;
        } else {
          selectedLocation.value = "all";
          locationInputValue.value = "";
          locationInputDisplay.value = "";
          locationError.value = "";
          locationTouched.value = false;
        }
      } else {
        selectedLocation.value = "all";
        locationInputValue.value = "";
        locationInputDisplay.value = "";
        locationError.value = "";
        locationTouched.value = false;
      }
      showLoadingMessage.value = false;
    }
    watch(
      locations,
      (list) => {
        if (didHydrateFromUrl.value) return;
        if (!(list == null ? void 0 : list.length)) return;
        didHydrateFromUrl.value = true;
        hydrateFromUrl();
      },
      { immediate: true }
    );
    const syncUrlFromState = debounce(() => {
      window.history.replaceState({}, "", assembleUrl());
    }, 250);
    watch([nameQuery, selectedLocation, selectedPostType], () => {
      if (!didHydrateFromUrl.value) return;
      syncUrlFromState();
    });
    onMounted(() => {
      const onPopState = () => {
        if (locations.value.length) hydrateFromUrl();
      };
      window.addEventListener("popstate", onPopState);
      onBeforeUnmount(() => window.removeEventListener("popstate", onPopState));
    });
    onMounted(() => {
      const onWindowClick = (event) => {
        if (!event.target.closest(".custom-select.is-active")) ;
      };
      window.addEventListener("click", onWindowClick);
      onBeforeUnmount(() => window.removeEventListener("click", onWindowClick));
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        _cache[22] || (_cache[22] = createBaseVNode("h2", { class: "sr-only" }, "Energy Advisor Listings", -1)),
        _cache[23] || (_cache[23] = createBaseVNode("a", {
          href: "#pqeasResults",
          class: "sr-only skip-to-results"
        }, "Skip to results", -1)),
        createVNode(Transition, { name: "fader" }, {
          default: withCtx(() => [
            isVisible.value || !isVisible.value && filteredPqeas.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
              _cache[14] || (_cache[14] = createBaseVNode("h2", { class: "settings-headline" }, "Filter energy advisor list", -1)),
              createBaseVNode("div", _hoisted_3$2, [
                isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_4$1, [
                  _cache[9] || (_cache[9] = createBaseVNode("label", { for: "pqeaLocation" }, "Filter by service region", -1)),
                  createBaseVNode("div", _hoisted_5$1, [
                    withDirectives(createBaseVNode("input", {
                      id: "pqeaLocation",
                      class: normalizeClass(["location-input", { "has-valid-selection": hasValidLocationSelection.value }]),
                      type: "text",
                      inputmode: "search",
                      autocomplete: "off",
                      placeholder: "The community you live closest to",
                      list: isMobile.value ? "locationListMobile" : "locationList",
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => locationInputProxy.value = $event),
                      onFocus: handleLocationFocus,
                      onBlur: _cache[1] || (_cache[1] = ($event) => commitLocation("blur")),
                      onChange: _cache[2] || (_cache[2] = ($event) => commitLocation("change")),
                      onKeydown: _cache[3] || (_cache[3] = withKeys(withModifiers(($event) => commitLocation("enter"), ["prevent"]), ["enter"])),
                      "aria-invalid": locationTouched.value && locationError.value ? "true" : "false",
                      "aria-describedby": locationTouched.value && locationError.value ? "locationError" : null
                    }, null, 42, _hoisted_6$1), [
                      [vModelText, locationInputProxy.value]
                    ]),
                    hasValidLocationSelection.value ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "location-clear-btn",
                      "aria-label": "Clear selected service region",
                      onMousedown: _cache[4] || (_cache[4] = withModifiers(() => {
                      }, ["prevent"])),
                      onClick: withModifiers(clearLocationSelection, ["prevent"])
                    }, null, 32)) : createCommentVNode("", true)
                  ]),
                  !isMobile.value ? (openBlock(), createElementBlock("datalist", _hoisted_7$2, [
                    _cache[7] || (_cache[7] = createBaseVNode("option", { value: "All Locations" }, null, -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(locations.value, (loc) => {
                      return openBlock(), createElementBlock("option", {
                        key: loc,
                        value: loc
                      }, null, 8, _hoisted_8$2);
                    }), 128))
                  ])) : (openBlock(), createElementBlock("datalist", _hoisted_9$2, [
                    locationQueryIsEmpty.value ? (openBlock(), createElementBlock("option", _hoisted_10$2)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      _cache[8] || (_cache[8] = createBaseVNode("option", { value: "All Locations" }, null, -1)),
                      (openBlock(true), createElementBlock(Fragment, null, renderList(mobileLocationOptions.value, (loc) => {
                        return openBlock(), createElementBlock("option", {
                          key: loc,
                          value: loc
                        }, null, 8, _hoisted_11$2);
                      }), 128))
                    ], 64))
                  ])),
                  locationTouched.value && locationError.value ? (openBlock(), createElementBlock("p", _hoisted_12$2, toDisplayString(locationError.value), 1)) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_13$2, [
                  _cache[10] || (_cache[10] = createBaseVNode("label", { for: "nameInput" }, "Filter by company name", -1)),
                  createBaseVNode("div", _hoisted_14$2, [
                    withDirectives(createBaseVNode("input", {
                      id: "nameInput",
                      type: "search",
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => nameQuery.value = $event),
                      autocomplete: "organization",
                      placeholder: "Type a company name"
                    }, null, 512), [
                      [
                        vModelText,
                        nameQuery.value,
                        void 0,
                        { trim: true }
                      ]
                    ])
                  ])
                ])) : createCommentVNode("", true),
                isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_15$2, [
                  _cache[12] || (_cache[12] = createBaseVNode("label", { for: "pqeaPostType" }, "Filter by advisor type", -1)),
                  createBaseVNode("div", _hoisted_16$2, [
                    withDirectives(createBaseVNode("select", {
                      id: "pqeaPostType",
                      class: "select select--type",
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => selectedPostType.value = $event)
                    }, [..._cache[11] || (_cache[11] = [
                      createBaseVNode("option", { value: "pqeas-renovation" }, "Home renovation", -1),
                      createBaseVNode("option", { value: "pqeas-construction" }, "New home construction", -1)
                    ])], 512), [
                      [vModelSelect, selectedPostType.value]
                    ])
                  ])
                ])) : createCommentVNode("", true)
              ]),
              isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_17$2, [
                createBaseVNode("p", _hoisted_18$2, " Showing " + toDisplayString(displayedPqeas.value.length) + " of " + toDisplayString(filteredPqeas.value.length) + " energy advisors ", 1),
                createBaseVNode("div", _hoisted_19$2, [
                  createBaseVNode("button", {
                    class: "copy-link share",
                    onClick: withModifiers(addLinkToClipboard, ["prevent"]),
                    onKeydown: withKeys(withModifiers(addLinkToClipboard, ["prevent"]), ["enter"]),
                    disabled: !nameQuery.value.trim() && selectedLocation.value === "all" && selectedPostType.value === defaultPostType.value,
                    type: "button"
                  }, " Share ", 40, _hoisted_20$2),
                  _cache[13] || (_cache[13] = createBaseVNode("span", {
                    class: "copy-message isFadedOut",
                    role: "status",
                    "aria-live": "polite"
                  }, null, -1))
                ]),
                createBaseVNode("button", {
                  class: "clear-filters",
                  onClick: withModifiers(clearFilters, ["prevent"]),
                  onKeydown: withKeys(withModifiers(clearFilters, ["prevent"]), ["enter"]),
                  type: "button"
                }, " Reset selection ", 40, _hoisted_21$2)
              ])) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        }),
        createCommentVNode("", true),
        createBaseVNode("table", _hoisted_24$2, [
          _cache[19] || (_cache[19] = createBaseVNode("caption", { class: "sr-only" }, "Program Qualified Energy Advisors", -1)),
          _cache[20] || (_cache[20] = createBaseVNode("colgroup", null, [
            createBaseVNode("col", { class: "col col--1 odd col--pqea__company-and-location" }),
            createBaseVNode("col", { class: "col col--2 even col--pqea__contact-name" }),
            createBaseVNode("col", { class: "col col--3 odd col--pqea__email-and-phone" })
          ], -1)),
          _cache[21] || (_cache[21] = createBaseVNode("thead", null, [
            createBaseVNode("tr", null, [
              createBaseVNode("th", { class: "pqea-heading odd pqea-heading--company-and-location" }, "Company name & head office location"),
              createBaseVNode("th", { class: "pqea-heading even pqea-heading--contact-name" }, "Energy advisor"),
              createBaseVNode("th", { class: "pqea-heading odd pqea-heading--email-and-phone" }, "Email & phone")
            ])
          ], -1)),
          createBaseVNode("tbody", {
            ref_key: "resultsTbody",
            ref: resultsTbody
          }, [
            filteredPqeas.value.length === 0 && !isLoading.value ? (openBlock(), createElementBlock("tr", _hoisted_25$1, [..._cache[17] || (_cache[17] = [
              createBaseVNode("td", { colspan: "100%" }, [
                createBaseVNode("p", {
                  class: "no-results",
                  role: "status",
                  "aria-live": "polite"
                }, "Sorry, no results found.")
              ], -1)
            ])])) : createCommentVNode("", true),
            isLoading.value ? (openBlock(), createElementBlock("tr", _hoisted_26$2, [..._cache[18] || (_cache[18] = [
              createBaseVNode("td", { colspan: "100%" }, [
                createBaseVNode("p", { class: "no-results loading" }, "Retrieving a list of energy advisors, please wait...")
              ], -1)
            ])])) : createCommentVNode("", true),
            pqeas.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(displayedPqeas.value, (pqea, index) => {
              var _a2;
              return openBlock(), createElementBlock("tr", {
                key: (pqea == null ? void 0 : pqea.id) || ((_a2 = pqea == null ? void 0 : pqea.details) == null ? void 0 : _a2.company_name) || index,
                class: normalizeClass(`pqea result result--${index + 1} ${0 === (index + 1) % 2 ? "even" : "odd"}`)
              }, [
                createBaseVNode("td", _hoisted_27$2, [
                  createBaseVNode("div", _hoisted_28$2, [
                    pqea.details.company_website ? (openBlock(), createElementBlock("a", {
                      key: 0,
                      class: "pqea__company contractor__company external external-app-link",
                      href: pqea.details.company_website,
                      target: "_blank",
                      onClick: ($event) => onProviderLinkClick(pqea),
                      "aria-label": unref(decodeHtmlEntities)(pqea.details.company_name) + " website, opens in a new tab/window."
                    }, toDisplayString(pqea.details.company_name ? unref(decodeHtmlEntities)(pqea.details.company_name) : "Website"), 9, _hoisted_29$2)) : (openBlock(), createElementBlock("p", _hoisted_30$2, toDisplayString(pqea.details.company_name ? unref(decodeHtmlEntities)(pqea.details.company_name) : "No company name provided"), 1)),
                    createBaseVNode("p", _hoisted_31$2, toDisplayString(pqea.details.company_location ? pqea.details.company_location : "Not provided"), 1)
                  ])
                ]),
                createBaseVNode("td", _hoisted_32$2, [
                  createBaseVNode("p", null, toDisplayString(pqea.details.contact_name ? pqea.details.contact_name : "Not provided"), 1)
                ]),
                createBaseVNode("td", _hoisted_33$2, [
                  createBaseVNode("div", _hoisted_34$2, [
                    pqea.details.email ? (openBlock(), createElementBlock("a", {
                      key: 0,
                      class: "pqea__email ellipsis",
                      href: "mailto:" + pqea.details.email,
                      onClick: withModifiers(($event) => onEmailPhoneClick(pqea, "email"), ["prevent"])
                    }, [
                      createBaseVNode("span", {
                        innerHTML: insertBreakableChar(pqea.details.email)
                      }, null, 8, _hoisted_36$2)
                    ], 8, _hoisted_35$2)) : (openBlock(), createElementBlock("p", _hoisted_37$2, "No email provided")),
                    pqea.details.phone ? (openBlock(), createElementBlock("a", {
                      key: 2,
                      class: "pqea__telephone",
                      href: "tel:+1" + pqea.details.phone.replace(/-/g, ""),
                      onClick: withModifiers(($event) => onEmailPhoneClick(pqea, "phone"), ["prevent"])
                    }, toDisplayString(pqea.details.phone), 9, _hoisted_38$2)) : (openBlock(), createElementBlock("p", _hoisted_39$2, "No phone number provided"))
                  ])
                ])
              ], 2);
            }), 128)) : createCommentVNode("", true)
          ], 512)
        ]),
        displayedPqeas.value.length && filteredPqeas.value.length > displayedPqeas.value.length ? (openBlock(), createElementBlock("div", _hoisted_40$2, [
          createBaseVNode("div", _hoisted_41$2, [
            createBaseVNode("button", {
              type: "button",
              onClick: loadMore,
              ref_key: "loadMoreBtn",
              ref: loadMoreBtn
            }, " Load " + toDisplayString(nextLoadCount.value) + " more energy advisor" + toDisplayString(nextLoadCount.value === 1 ? "" : "s"), 513),
            createBaseVNode("p", _hoisted_42$2, " Showing " + toDisplayString(displayedPqeas.value.length) + " of " + toDisplayString(filteredPqeas.value.length), 1)
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const PQEAFilterApp = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-4d9e59be"]]);
const _hoisted_1$1 = { class: "inner" };
const _hoisted_2$1 = {
  key: 0,
  id: "contractorsFilterControls",
  class: "contractorsFilterControls filter-container"
};
const _hoisted_3$1 = { class: "filter-controls-container" };
const _hoisted_7$1 = {
  key: 1,
  class: "control type-input location-input-control"
};
const _hoisted_8$1 = { class: "custom-input location-input-wrapper" };
const _hoisted_9$1 = ["list", "aria-invalid", "aria-describedby"];
const _hoisted_10$1 = {
  key: 0,
  id: "locationList"
};
const _hoisted_11$1 = ["value"];
const _hoisted_12$1 = {
  key: 1,
  id: "locationListMobile"
};
const _hoisted_13$1 = {
  key: 0,
  value: "Please type to find your community"
};
const _hoisted_14$1 = ["value"];
const _hoisted_15$1 = {
  key: 2,
  id: "locationError",
  class: "message error-message",
  role: "alert"
};
const _hoisted_16$1 = {
  key: 2,
  class: "control type-input"
};
const _hoisted_17$1 = { class: "custom-input" };
const _hoisted_18$1 = {
  key: 3,
  class: "control type-select"
};
const _hoisted_19$1 = { class: "custom-select" };
const _hoisted_20$1 = ["value"];
const _hoisted_21$1 = {
  key: 4,
  class: "control program-select"
};
const _hoisted_22$1 = { class: "custom-select" };
const _hoisted_23$1 = ["value"];
const _hoisted_24$1 = {
  key: 0,
  class: "control reset-filters"
};
const _hoisted_25 = {
  class: "totals",
  "aria-live": "polite"
};
const _hoisted_26$1 = { class: "control copy-link-btn" };
const _hoisted_27$1 = ["onKeydown", "disabled"];
const _hoisted_28$1 = ["onKeydown"];
const _hoisted_29$1 = {
  key: 1,
  class: "contractorsFilterPagination control pagination pagination--top"
};
const _hoisted_30$1 = ["disabled"];
const _hoisted_31$1 = { class: "pages" };
const _hoisted_32$1 = { class: "numValue current-page" };
const _hoisted_33$1 = { class: "numValue total-pages" };
const _hoisted_34$1 = ["disabled"];
const _hoisted_35$1 = { class: "totals" };
const _hoisted_36$1 = { class: "results-count" };
const _hoisted_37$1 = { class: "numValue paginated-contractors" };
const _hoisted_38$1 = { class: "numValue filtered-contractors" };
const _hoisted_39$1 = { class: "sr-status sr-only" };
const _hoisted_40$1 = {
  class: "results-count",
  role: "status",
  "aria-live": "polite"
};
const _hoisted_41$1 = { class: "numValue paginated-contractors" };
const _hoisted_42$1 = { class: "numValue filtered-contractors" };
const _hoisted_43$1 = {
  class: "pages",
  role: "status",
  "aria-live": "polite"
};
const _hoisted_44$1 = { class: "numValue current-page" };
const _hoisted_45$1 = { class: "numValue total-pages" };
const _hoisted_49$1 = {
  id: "contractorsResults",
  class: "contractorsResults results table table--striped"
};
const _hoisted_50$1 = {
  key: 0,
  class: "no-results"
};
const _hoisted_51$1 = {
  key: 1,
  class: "is-loading",
  role: "status",
  "aria-live": "polite"
};
const _hoisted_52$1 = {
  "data-label": "Company name and head office location",
  class: "contractor__company-and-location"
};
const _hoisted_53$1 = { class: "table-link-wrapper" };
const _hoisted_54$1 = ["href", "onClick", "aria-label"];
const _hoisted_55$1 = {
  key: 1,
  class: "contractor__company"
};
const _hoisted_56$1 = {
  key: 2,
  class: "has-icon location"
};
const _hoisted_57$1 = {
  "data-label": "Company email and phone",
  class: "contractor__email-and-phone"
};
const _hoisted_58$1 = { class: "clip-text" };
const _hoisted_59$1 = { class: "table-link-wrapper" };
const _hoisted_60$1 = ["href", "onClick"];
const _hoisted_62 = {
  key: 1,
  class: "contractor__email"
};
const _hoisted_63 = { class: "table-link-wrapper" };
const _hoisted_64$1 = ["href", "onClick"];
const _hoisted_65$1 = {
  key: 1,
  class: "contractor__telephone"
};
const _hoisted_66$1 = {
  "data-label": "Upgrade type(s)",
  class: "contractor__upgrade-types"
};
const _hoisted_67$1 = { key: 0 };
const _hoisted_68$1 = {
  "data-label": "Qualified program(s)",
  class: "contractor__program-designations"
};
const _hoisted_69$1 = { key: 0 };
const _hoisted_70$1 = ["aria-label"];
const _hoisted_71$1 = {
  key: 0,
  class: "contractorsFilterControls filter-container filter-container--bottom"
};
const _hoisted_72$1 = {
  key: 0,
  class: "control load-more"
};
const _hoisted_73$1 = { class: "totals" };
const MOBILE_HINT_EMPTY = "Please type to find your community";
const MOBILE_HINT_MORE = "Continue typing to see more results";
const CONDO_HEAT_PUMP_NAME = "Heat pumps for condos and apartments";
const CONDO_HEAT_PUMP_SLUG = "heat-pumps-for-condos-and-apartments";
const PREFERRED_SETTINGS_KEY$1 = "preferredSettings";
const _sfc_main$1 = {
  __name: "contractorVueApp",
  setup(__props) {
    var _a;
    function debounce(fn, delay = 500) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }
    const normalize = (s = "") => decodeHtmlEntities(String(s)).trim().toLowerCase();
    const toNormalizedList = (list = []) => list.filter(Boolean).map((raw) => ({ raw, norm: normalize(raw) }));
    const includesFuzzyNorm = (haystackNorm, needleNorm) => {
      if (!needleNorm) return true;
      return (haystackNorm || "").includes(needleNorm);
    };
    function findClosestLocation(raw, normalizedLocations2) {
      const q = normalize(raw);
      if (q === normalize(MOBILE_HINT_EMPTY) || q === normalize(MOBILE_HINT_MORE)) {
        return { match: "all", reason: "empty" };
      }
      if (!q) return { match: "all", reason: "empty" };
      if (q === "all" || q === "all locations") return { match: "all", reason: "all" };
      const list = normalizedLocations2 || [];
      const exact = list.find((x) => x.norm === q);
      if (exact) return { match: exact.raw, reason: "exact" };
      const starts = [];
      for (const x of list) {
        if (x.norm.startsWith(q)) {
          starts.push(x.raw);
          if (starts.length >= 10) break;
        }
      }
      if (starts.length === 1) return { match: starts[0], reason: "startsWith" };
      if (starts.length > 1) return { match: null, reason: "ambiguous_starts", candidates: starts };
      const includes = [];
      for (const x of list) {
        const idx = x.norm.indexOf(q);
        if (idx >= 0) includes.push({ raw: x.raw, idx });
      }
      includes.sort((a, b) => a.idx - b.idx || a.raw.length - b.raw.length || a.raw.localeCompare(b.raw));
      const top = includes.slice(0, 10).map((x) => x.raw);
      if (top.length === 1) return { match: top[0], reason: "includes" };
      if (top.length > 1) return { match: null, reason: "ambiguous_includes", candidates: top };
      return { match: null, reason: "none" };
    }
    const loadMoreBtn = /* @__PURE__ */ ref(null);
    const resultsTbody = /* @__PURE__ */ ref(null);
    const contractors = /* @__PURE__ */ ref([]);
    const shuffledContractors = /* @__PURE__ */ ref([]);
    const isVisible = /* @__PURE__ */ ref(true);
    const showLoadingMessage = /* @__PURE__ */ ref(true);
    const isLoading = /* @__PURE__ */ ref(false);
    const nameQuery = /* @__PURE__ */ ref("");
    const defaultSelectedUpgradeType = /* @__PURE__ */ ref("all");
    const selectedUpgradeType = /* @__PURE__ */ ref("all");
    const defaultSelectedProgram = /* @__PURE__ */ ref("all");
    const selectedProgram = /* @__PURE__ */ ref("all");
    const selectedLocation = /* @__PURE__ */ ref("all");
    const activeClass = /* @__PURE__ */ ref("is-active");
    const updatingClass = /* @__PURE__ */ ref("is-updating");
    const displayMode = /* @__PURE__ */ ref("loadMore");
    const pageSize = /* @__PURE__ */ ref(30);
    const visibleCount = /* @__PURE__ */ ref(pageSize.value);
    const currentPage = /* @__PURE__ */ ref(1);
    const oldPaginatedContractorsCount = /* @__PURE__ */ ref(0);
    const oldFilteredContractorsCount = /* @__PURE__ */ ref(0);
    const isMobile = /* @__PURE__ */ ref(false);
    onMounted(() => {
      isMobile.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    });
    const locationInputValue = /* @__PURE__ */ ref("");
    const locationInputDisplay = /* @__PURE__ */ ref("");
    const isLocationFocused = /* @__PURE__ */ ref(false);
    const locationTouched = /* @__PURE__ */ ref(false);
    const locationError = /* @__PURE__ */ ref("");
    watch(locationInputValue, (v) => {
      if (isMobile.value) locationInputDisplay.value = v || "";
    });
    const locationInputProxy = computed({
      get() {
        return isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      },
      set(val) {
        if (isMobile.value) locationInputDisplay.value = val;
        else locationInputValue.value = val;
      }
    });
    function handleLocationFocus() {
      isLocationFocused.value = true;
      if (isMobile.value) {
        setTimeout(() => {
          var _a2;
          (_a2 = document.querySelector("#contractorLocation")) == null ? void 0 : _a2.focus();
        }, 300);
      }
    }
    const commitLocation = (trigger2 = "change") => {
      const el = document.querySelector("#contractorLocation");
      if (!isMobile.value && (trigger2 === "enter" || trigger2 === "change")) {
        el == null ? void 0 : el.focus();
      }
      locationTouched.value = true;
      if (isMobile.value && trigger2 === "blur") {
        if (el) locationInputDisplay.value = el.value;
      }
      const raw = (isMobile.value ? locationInputDisplay.value : locationInputValue.value) || "";
      const normalizedList = normalizedLocations.value;
      const { match, reason, candidates = [] } = findClosestLocation(raw, normalizedList);
      if (!raw.trim()) {
        selectedLocation.value = "all";
        locationInputValue.value = "";
        locationInputDisplay.value = "";
        locationError.value = "";
        isLocationFocused.value = false;
        return;
      }
      if (match) {
        selectedLocation.value = match;
        locationError.value = "";
        locationInputValue.value = match === "all" ? "" : match;
        locationInputDisplay.value = match === "all" ? "" : match;
      } else {
        selectedLocation.value = "all";
        const example = candidates.slice(0, 3).join(", ");
        locationError.value = reason.startsWith("ambiguous") ? `That matches multiple service regions. Please choose one from the list (e.g., ${example}${candidates.length > 3 ? "…" : ""}).` : "That service region was not recognized. Please the community you live in or are closest to from the available options.";
      }
      isLocationFocused.value = false;
    };
    const locationQuery = computed(() => {
      const raw = isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      return normalize(raw || "");
    });
    const locationQueryIsEmpty = computed(() => !locationQuery.value);
    const hasValidLocationSelection = computed(
      () => selectedLocation.value !== "all" && !locationError.value && locations.value.includes(selectedLocation.value)
    );
    function clearLocationSelection() {
      selectedLocation.value = "all";
      locationInputValue.value = "";
      locationInputDisplay.value = "";
      locationTouched.value = false;
      locationError.value = "";
      isLocationFocused.value = true;
      nextTick(() => {
        var _a2;
        (_a2 = document.querySelector("#contractorLocation")) == null ? void 0 : _a2.focus();
      });
    }
    const publicDomain = /* @__PURE__ */ ref("https://betterhomes.gov.bc.ca");
    const contractorsAPI = `${((_a = window.site) == null ? void 0 : _a.domain) ? window.site.domain : publicDomain.value}/wp-json/custom/v1/contractors`;
    const CONDO_PROGRAM_SUFFIX_BY_SLUG = {
      esp: "ESP only",
      hrr: "HRR only"
    };
    const itemsToClearFromSessionStorage = /* @__PURE__ */ ref([
      "faqsData",
      "faqsTimestamp",
      "pqeasData",
      "pqeasTimestamp",
      "rebatesData",
      "rebatesTimestamp"
    ]);
    const isQuotaExceededError = (error) => {
      if (!error) return false;
      return error.code === 22 || error.code === 1014 || error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED";
    };
    const isDataValid = (timestamp) => {
      const timeElapsed = Date.now() - parseInt(String(timestamp), 10);
      return timeElapsed / (1e3 * 60 * 60) < 24;
    };
    const fetchData = async () => {
      try {
        isLoading.value = true;
        showLoadingMessage.value = true;
        const readCache = (store) => {
          const data = store.getItem("contractorsData");
          const ts = store.getItem("contractorsTimestamp");
          if (data && ts && isDataValid(ts)) {
            try {
              return JSON.parse(data);
            } catch {
              return null;
            }
          }
          return null;
        };
        let cached = readCache(sessionStorage);
        if (!cached && !isShareSourceUrl()) cached = readCache(localStorage);
        if (cached) {
          contractors.value = cached;
          shuffledContractors.value = shuffleArray([...cached]);
          showLoadingMessage.value = false;
          isLoading.value = false;
          return;
        }
        const response = await fetch(contractorsAPI, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const json = await response.json();
        try {
          itemsToClearFromSessionStorage.value.forEach((item) => sessionStorage.removeItem(item));
          sessionStorage.clear();
        } catch (clearError) {
          console.warn("Error clearing sessionStorage:", clearError);
        }
        const writeCache = (store) => {
          store.setItem("contractorsData", JSON.stringify(json));
          store.setItem("contractorsTimestamp", Date.now().toString());
        };
        try {
          writeCache(sessionStorage);
        } catch (storageError) {
          if (isQuotaExceededError(storageError)) {
            console.warn("SessionStorage quota exceeded. Falling back to localStorage.");
            if (!isShareSourceUrl()) {
              try {
                writeCache(localStorage);
              } catch (lsError) {
                console.error("Error setting data in localStorage:", lsError);
              }
            }
          } else {
            console.error("Error setting data in sessionStorage:", storageError);
            throw storageError;
          }
        }
        contractors.value = json;
        shuffledContractors.value = shuffleArray([...json]);
        showLoadingMessage.value = false;
        isLoading.value = false;
      } catch (error) {
        console.error("Error fetching contractors data:", error);
        throw error;
      }
    };
    function collectUniqueNames(array, key) {
      const unique = /* @__PURE__ */ new Set();
      for (const c of array) {
        const items = c == null ? void 0 : c[key];
        if (!items) continue;
        if (Array.isArray(items)) {
          for (const it of items) if (it == null ? void 0 : it.name) unique.add(it.name);
        } else if (items == null ? void 0 : items.name) {
          unique.add(items.name);
        }
      }
      return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }
    const normalizeSlug2 = (value = "") => String(value || "").trim().toLowerCase();
    const isCondoHeatPumpParentTerm = (term) => {
      const slug = normalizeSlug2(term == null ? void 0 : term.slug);
      const name = String((term == null ? void 0 : term.name) || "").trim();
      return slug === CONDO_HEAT_PUMP_SLUG || name === CONDO_HEAT_PUMP_NAME;
    };
    const getVisibleProgramDesignations = (contractor) => {
      const designations = Array.isArray(contractor == null ? void 0 : contractor.program_designations) ? contractor.program_designations.filter(Boolean) : [];
      if (selectedProgram.value !== "all") {
        return designations.filter((designation) => (designation == null ? void 0 : designation.name) === selectedProgram.value);
      }
      return designations;
    };
    const getVisibleContractorTypeLabels = (contractor) => {
      const rawTypes = Array.isArray(contractor == null ? void 0 : contractor.types) ? contractor.types.filter(Boolean) : [];
      const visibleProgramSlugs = new Set(
        getVisibleProgramDesignations(contractor).map((designation) => normalizeSlug2(designation == null ? void 0 : designation.slug)).filter(Boolean)
      );
      const condoParent = rawTypes.find(isCondoHeatPumpParentTerm) || null;
      const condoParentId = Number((condoParent == null ? void 0 : condoParent.term_id) || (condoParent == null ? void 0 : condoParent.id) || 0);
      const condoProgramChildren = rawTypes.filter((term) => {
        const slug = normalizeSlug2(term == null ? void 0 : term.slug);
        if (!Object.prototype.hasOwnProperty.call(CONDO_PROGRAM_SUFFIX_BY_SLUG, slug)) return false;
        const termParentId = Number((term == null ? void 0 : term.parent) || 0);
        if (condoParentId > 0) return termParentId === condoParentId;
        return termParentId > 0;
      });
      const condoProgramChildSlugs = new Set(
        condoProgramChildren.map((term) => normalizeSlug2(term == null ? void 0 : term.slug)).filter(Boolean)
      );
      const hasBothCondoProgramChildren = condoProgramChildSlugs.has("esp") && condoProgramChildSlugs.has("hrr");
      const output = [];
      const seen = /* @__PURE__ */ new Set();
      const addLabel = (label) => {
        if (!label || seen.has(label)) return;
        seen.add(label);
        output.push(label);
      };
      for (const term of rawTypes) {
        if (isCondoHeatPumpParentTerm(term)) continue;
        const slug = normalizeSlug2(term == null ? void 0 : term.slug);
        if (Object.prototype.hasOwnProperty.call(CONDO_PROGRAM_SUFFIX_BY_SLUG, slug)) continue;
        addLabel(term == null ? void 0 : term.name);
      }
      if (hasBothCondoProgramChildren) {
        addLabel(CONDO_HEAT_PUMP_NAME);
      } else if (condoProgramChildren.length) {
        for (const term of condoProgramChildren) {
          const slug = normalizeSlug2(term == null ? void 0 : term.slug);
          if (!visibleProgramSlugs.has(slug)) continue;
          addLabel(
            selectedProgram.value === "all" ? `${CONDO_HEAT_PUMP_NAME} (${CONDO_PROGRAM_SUFFIX_BY_SLUG[slug]})` : CONDO_HEAT_PUMP_NAME
          );
        }
      } else if (condoParent) {
        addLabel(CONDO_HEAT_PUMP_NAME);
      }
      return output;
    };
    const getSelectableContractorTypeLabels = (contractor) => {
      const selectable = /* @__PURE__ */ new Set();
      for (const typeLabel of getVisibleContractorTypeLabels(contractor)) {
        if (typeLabel.startsWith(`${CONDO_HEAT_PUMP_NAME} (`)) {
          selectable.add(CONDO_HEAT_PUMP_NAME);
          continue;
        }
        selectable.add(typeLabel);
      }
      return Array.from(selectable);
    };
    const types = computed(() => {
      const unique = /* @__PURE__ */ new Set();
      for (const contractor of contractors.value) {
        for (const typeLabel of getSelectableContractorTypeLabels(contractor)) {
          unique.add(typeLabel);
        }
      }
      return Array.from(unique).sort((a, b) => a.localeCompare(b));
    });
    const programs = computed(() => collectUniqueNames(contractors.value, "program_designations"));
    const locations = computed(() => collectUniqueNames(contractors.value, "locations"));
    const normalizedLocations = computed(() => toNormalizedList(locations.value));
    const resolvePreferredLocation = () => {
      const preferred = readPreferredSettings();
      const loc = preferred == null ? void 0 : preferred.location;
      if (!loc) return null;
      const candidates = [loc.name, loc.slug, loc.region, loc.region_slug].map((value) => value ? String(value).trim() : "").filter(Boolean);
      if (!candidates.length) return null;
      const list = normalizedLocations.value;
      for (const candidate of candidates) {
        const { match } = findClosestLocation(candidate, list);
        if (match && match !== "all") return match;
      }
      return null;
    };
    const mobileLocationOptions = computed(() => {
      const q = locationQuery.value;
      if (!q) return [];
      const list = normalizedLocations.value;
      const starts = [];
      const includes = [];
      for (const x of list) {
        if (x.norm.startsWith(q)) {
          starts.push(x.raw);
          if (starts.length >= 10) return starts;
        } else if (x.norm.includes(q)) {
          includes.push(x.raw);
        }
      }
      for (const raw of includes) {
        starts.push(raw);
        if (starts.length >= 10) break;
      }
      return starts;
    });
    const contractorIndex = computed(() => {
      const arr = shuffledContractors.value || [];
      return arr.map((c) => {
        const companyNorm = normalize((c == null ? void 0 : c.company_name) || "");
        const typeNames = new Set(getSelectableContractorTypeLabels(c));
        const locNames = new Set(((c == null ? void 0 : c.locations) || []).map((l) => l == null ? void 0 : l.name).filter(Boolean));
        const progNames = new Set(((c == null ? void 0 : c.program_designations) || []).map((p2) => p2 == null ? void 0 : p2.name).filter(Boolean));
        return { c, companyNorm, typeNames, locNames, progNames };
      });
    });
    const filteredContractors = computed(() => {
      const typeSel = selectedUpgradeType.value;
      const locSel = selectedLocation.value;
      const progSel = selectedProgram.value;
      const nameNeedleNorm = normalize(nameQuery.value || "");
      const out = [];
      for (const row of contractorIndex.value) {
        if (typeSel !== "all" && !row.typeNames.has(typeSel)) continue;
        if (nameNeedleNorm && !includesFuzzyNorm(row.companyNorm, nameNeedleNorm)) continue;
        if (locSel !== "all" && !row.locNames.has(locSel)) continue;
        if (progSel !== "all" && !row.progNames.has(progSel)) continue;
        out.push(row.c);
      }
      return out;
    });
    const totalPages = computed(() => {
      if (displayMode.value !== "paginate") return 1;
      const total = filteredContractors.value.length;
      return total > 0 ? Math.ceil(total / pageSize.value) : 1;
    });
    const displayedContractors = computed(() => {
      const list = filteredContractors.value;
      if (displayMode.value === "loadMore") {
        return list.slice(0, visibleCount.value);
      }
      const start = (currentPage.value - 1) * pageSize.value;
      return list.slice(start, start + pageSize.value);
    });
    const remainingCount = computed(
      () => Math.max(0, filteredContractors.value.length - displayedContractors.value.length)
    );
    const nextLoadCount = computed(
      () => Math.min(pageSize.value, remainingCount.value)
    );
    const focusFirstNewLink = async (startIndex) => {
      var _a2, _b;
      await nextTick();
      const tbody = resultsTbody.value;
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr.contractor");
      for (let i = startIndex; i < rows.length; i++) {
        const link = rows[i].querySelector('a[href]:not([tabindex="-1"])');
        if (link) {
          link.focus({ preventScroll: true });
          link.scrollIntoView({ block: "center" });
          return;
        }
      }
      (_b = (_a2 = loadMoreBtn.value) == null ? void 0 : _a2.focus) == null ? void 0 : _b.call(_a2);
    };
    const loadMore = async () => {
      const startIndex = displayedContractors.value.length;
      visibleCount.value = Math.min(
        visibleCount.value + pageSize.value,
        filteredContractors.value.length
      );
      await focusFirstNewLink(startIndex);
    };
    const prevPage = () => currentPage.value > 1 ? currentPage.value-- : null;
    const nextPage = () => currentPage.value < totalPages.value ? currentPage.value++ : null;
    const assembleUrl = ({ includeSource = false } = {}) => {
      var _a2;
      const baseUrl = window.location.origin + window.location.pathname;
      const url = new URL(baseUrl);
      url.searchParams.set("tool", "contractors");
      if (includeSource) {
        url.searchParams.set("source", "share");
      }
      if ((_a2 = nameQuery.value) == null ? void 0 : _a2.trim()) {
        url.searchParams.set("company", nameQuery.value.trim());
      }
      if (selectedUpgradeType.value && selectedUpgradeType.value !== "all") {
        url.searchParams.set("type", selectedUpgradeType.value);
      }
      if (selectedProgram.value && selectedProgram.value !== "all") {
        const programParam = PROGRAM_TO_SHORTHAND[selectedProgram.value] || selectedProgram.value;
        url.searchParams.set("program", programParam);
      }
      if (selectedLocation.value && selectedLocation.value !== "all") {
        url.searchParams.set("region", selectedLocation.value);
      }
      return url.toString();
    };
    function handleLinkCopiedMessageContent(event, target = ".filter-container", msg) {
      var _a2, _b, _c;
      const root = ((_b = (_a2 = event == null ? void 0 : event.target) == null ? void 0 : _a2.closest) == null ? void 0 : _b.call(_a2, target)) || document.querySelector(target) || document.body;
      const el = (_c = root == null ? void 0 : root.querySelector) == null ? void 0 : _c.call(root, ".copy-message");
      if (!el) return;
      el.textContent = msg;
      el.classList.remove("isFadedOut");
      setTimeout(() => el.classList.add("isFadedOut"), 1e3);
      setTimeout(() => {
        if (el.classList.contains("isFadedOut")) el.textContent = "";
      }, 1600);
    }
    async function copyTextToClipboard(text) {
      var _a2;
      if ((_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      } finally {
        document.body.removeChild(ta);
      }
      return ok;
    }
    const addLinkToClipboard = async (event) => {
      const url = assembleUrl({ includeSource: true });
      try {
        const ok = await copyTextToClipboard(url);
        handleLinkCopiedMessageContent(
          event,
          ".filter-container",
          ok ? "Shareable link copied to clipboard!" : "Copy failed"
        );
        if (!ok) console.warn("Clipboard fallback failed.");
      } catch (err) {
        console.error("Failed to copy URL:", err);
        handleLinkCopiedMessageContent(event, ".filter-container", "Copy failed");
      }
    };
    const canCopyLink = computed(() => {
      var _a2;
      return Boolean(
        ((_a2 = nameQuery.value) == null ? void 0 : _a2.trim()) || selectedUpgradeType.value && selectedUpgradeType.value !== "all" || selectedProgram.value && selectedProgram.value !== "all" || selectedLocation.value && selectedLocation.value !== "all"
      );
    });
    const isShareSourceUrl = () => new URLSearchParams(window.location.search).get("source") === "share";
    const normalizeProgramParam = (v = "") => decodeHtmlEntities(String(v)).trim().toLowerCase();
    const PROGRAM_SHORTHANDS = {
      esp: "Energy Savings Program (ESP)",
      hrr: "Home Renovation Rebate (HRR)"
    };
    const PROGRAM_TO_SHORTHAND = {
      "Energy Savings Program (ESP)": "ESP",
      "Home Renovation Rebate (HRR)": "HRR"
    };
    function readPreferredSettings() {
      if (isShareSourceUrl()) return null;
      try {
        const raw = localStorage.getItem(PREFERRED_SETTINGS_KEY$1);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    }
    const resetSelectsActiveState = () => {
      const activeSelects = document.querySelectorAll("#contractorFilterApp .custom-select.is-active");
      activeSelects.forEach((item) => item.classList.remove("is-active"));
    };
    const selectIsActive = (event) => {
      if (event.type !== "click") event.target.parentNode.classList.remove(activeClass.value);
      else event.target.parentNode.classList.toggle(activeClass.value);
    };
    const handleUpdatingAnimationClass = (elementCssPath) => {
      const elements = document.querySelectorAll(elementCssPath);
      elements.forEach((element) => {
        element.classList.add(updatingClass.value);
        setTimeout(() => element.classList.remove(updatingClass.value), 125);
      });
    };
    const onProviderLinkClick = (contractor) => {
      trackProviderClick({
        filterName: "contractor",
        upgradeType: selectedUpgradeType.value,
        program: selectedProgram.value,
        location: selectedLocation.value,
        companyName: contractor.company_name || "",
        destination: contractor.company_website || ""
      });
    };
    const onEmailPhoneClick = (contractor, linkType) => {
      var _a2;
      let destination = "";
      if (linkType === "email") {
        contractor.email ? `Email: ${contractor.email}` : "Email link";
        destination = `mailto:${contractor.email}`;
      } else {
        contractor.phone ? `Phone: ${contractor.phone}` : "Phone link";
        destination = `tel:+1${(_a2 = contractor.phone) == null ? void 0 : _a2.replace(/-/g, "")}`;
      }
      trackProviderClick({
        filterName: "contractor",
        upgradeType: selectedUpgradeType.value,
        program: selectedProgram.value,
        location: selectedLocation.value,
        companyName: contractor.company_name || "",
        destination
      });
    };
    const clearFilters = () => {
      resetSelectsActiveState();
      nameQuery.value = "";
      selectedUpgradeType.value = defaultSelectedUpgradeType.value;
      selectedProgram.value = defaultSelectedProgram.value;
      selectedLocation.value = "all";
      locationInputValue.value = "";
      locationInputDisplay.value = "";
      locationTouched.value = false;
      locationError.value = "";
      isLocationFocused.value = false;
      displayMode.value = "loadMore";
      currentPage.value = 1;
      visibleCount.value = pageSize.value;
      window.history.replaceState({}, "", assembleUrl());
      if (currentPage.value !== 1) handleUpdatingAnimationClass(".control.pagination .pages");
      currentPage.value = 1;
    };
    watch(selectedUpgradeType, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        trackProviderFilterChange({
          filterName: "contractor",
          upgradeType: newVal,
          program: selectedProgram.value,
          location: selectedLocation.value,
          label: `Upgrade Type changed to: ${newVal}`
        });
      }
    });
    watch(selectedProgram, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        trackProviderFilterChange({
          filterName: "contractor",
          upgradeType: selectedUpgradeType.value,
          program: newVal,
          location: selectedLocation.value,
          label: `Program changed to: ${newVal}`
        });
      }
    });
    watch(selectedLocation, (newVal, oldVal) => {
      if (newVal === oldVal) return;
      if (isLocationFocused.value) return;
      locationInputValue.value = newVal === "all" ? "" : newVal;
      if (newVal === "all" || locations.value.includes(newVal)) {
        locationError.value = "";
        locationTouched.value = false;
      }
      trackProviderFilterChange({
        filterName: "contractor",
        upgradeType: selectedUpgradeType.value,
        program: selectedProgram.value,
        location: newVal,
        label: `Location changed to: ${newVal}`
      });
    });
    watch([selectedUpgradeType, selectedProgram, selectedLocation, nameQuery], () => {
      currentPage.value = 1;
      visibleCount.value = pageSize.value;
    });
    watch(displayMode, () => {
      currentPage.value = 1;
      visibleCount.value = pageSize.value;
    });
    watch(totalPages, () => handleUpdatingAnimationClass(".control.pagination .total-pages"));
    watch(currentPage, () => handleUpdatingAnimationClass(".control.pagination .current-page"));
    watch(displayedContractors, () => {
      if (oldPaginatedContractorsCount.value !== displayedContractors.value.length) {
        oldPaginatedContractorsCount.value = displayedContractors.value.length;
        handleUpdatingAnimationClass(".control.pagination .paginated-contractors");
      }
    });
    watch(filteredContractors, () => {
      if (oldFilteredContractorsCount.value !== filteredContractors.value.length) {
        oldFilteredContractorsCount.value = filteredContractors.value.length;
        handleUpdatingAnimationClass(".control.pagination .filtered-contractors");
        handleUpdatingAnimationClass(".counter__value");
      }
    });
    watch(() => {
      var _a2;
      return (_a2 = window.site) == null ? void 0 : _a2.domain;
    }, (newVal) => {
      if (newVal) fetchData();
    });
    onMounted(() => {
      localAnalyticsReady();
      const appElement = document.getElementById("contractorFilterApp");
      const showControls = (appElement == null ? void 0 : appElement.getAttribute("data-show-controls")) === "false";
      isVisible.value = showControls;
      fetchData();
      showLoadingMessage.value = true;
      const urlParams = new URLSearchParams(window.location.search);
      const showParam = urlParams.get("show");
      if (showParam === "off") isVisible.value = false;
    });
    const didHydrateFromUrl = /* @__PURE__ */ ref(false);
    function hydrateFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const showParam = urlParams.get("show");
      const toolParam = urlParams.get("tool");
      if (toolParam !== null && toolParam !== "contractors") {
        console.warn('Tool parameter does not match "contractors". Initialization skipped.');
        return;
      }
      if (showParam === "off") isVisible.value = false;
      const companyName = urlParams.get("company");
      const serviceRegion = urlParams.get("region");
      const upgradeType = urlParams.get("type");
      const rebateProgram = urlParams.get("program");
      if (companyName == null ? void 0 : companyName.trim()) {
        nameQuery.value = companyName.trim();
      } else {
        nameQuery.value = "";
      }
      if (serviceRegion) {
        if (locations.value.includes(serviceRegion)) {
          selectedLocation.value = serviceRegion;
          locationInputValue.value = serviceRegion;
          locationInputDisplay.value = serviceRegion;
          locationError.value = "";
          locationTouched.value = false;
        } else {
          selectedLocation.value = "all";
          locationInputValue.value = serviceRegion;
          locationInputDisplay.value = serviceRegion;
          locationError.value = "That service region was not recognized. Please choose one from the list of available options.";
          locationTouched.value = true;
        }
      } else if (!isShareSourceUrl()) {
        const preferredLocation = resolvePreferredLocation();
        if (preferredLocation) {
          selectedLocation.value = preferredLocation;
          locationInputValue.value = preferredLocation;
          locationInputDisplay.value = preferredLocation;
          locationError.value = "";
          locationTouched.value = false;
        }
      } else {
        selectedLocation.value = "all";
        locationInputValue.value = "";
        locationInputDisplay.value = "";
        locationError.value = "";
        locationTouched.value = false;
      }
      if (upgradeType) {
        if (types.value.includes(upgradeType)) selectedUpgradeType.value = upgradeType;
        else console.warn(`Invalid upgrade type: ${upgradeType}`);
      }
      if (rebateProgram) {
        const raw = String(rebateProgram).trim();
        const key = normalizeProgramParam(raw);
        const expanded = PROGRAM_SHORTHANDS[key] || raw;
        const match = programs.value.includes(expanded) ? expanded : programs.value.includes(raw) ? raw : null;
        if (match) {
          selectedProgram.value = match;
        } else {
          console.warn(`Invalid rebate program: ${raw}`);
        }
      }
      showLoadingMessage.value = false;
    }
    watch(
      [types, programs, locations],
      ([t, p2, l]) => {
        if (didHydrateFromUrl.value) return;
        if (!t.length || !p2.length || !l.length) return;
        didHydrateFromUrl.value = true;
        hydrateFromUrl();
      },
      { immediate: true }
    );
    const syncUrlFromState = debounce(() => {
      window.history.replaceState({}, "", assembleUrl());
    }, 250);
    watch([selectedUpgradeType, selectedProgram, selectedLocation, nameQuery], () => {
      if (!didHydrateFromUrl.value) return;
      syncUrlFromState();
    });
    onMounted(() => {
      const onPopState = () => {
        if (types.value.length && programs.value.length && locations.value.length) {
          hydrateFromUrl();
        }
      };
      window.addEventListener("popstate", onPopState);
      onBeforeUnmount(() => window.removeEventListener("popstate", onPopState));
    });
    onMounted(() => {
      const onWindowClick = (event) => {
        if (!event.target.closest(".custom-select.is-active")) resetSelectsActiveState();
      };
      window.addEventListener("click", onWindowClick);
      onBeforeUnmount(() => window.removeEventListener("click", onWindowClick));
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("div", _hoisted_1$1, [
          _cache[41] || (_cache[41] = createBaseVNode("a", {
            href: "#contractorsResults",
            class: "sr-only skip-to-results"
          }, "Skip to results", -1)),
          isVisible.value || 1 < totalPages.value && !isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_2$1, [
            _cache[33] || (_cache[33] = createBaseVNode("h2", { class: "settings-headline" }, "Filter registered contractor list", -1)),
            createBaseVNode("div", _hoisted_3$1, [
              createCommentVNode("", true),
              isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
                _cache[15] || (_cache[15] = createBaseVNode("label", { for: "contractorLocation" }, "Filter by service region", -1)),
                createBaseVNode("div", _hoisted_8$1, [
                  withDirectives(createBaseVNode("input", {
                    id: "contractorLocation",
                    class: normalizeClass(["location-input", { "has-valid-selection": hasValidLocationSelection.value }]),
                    type: "text",
                    inputmode: "search",
                    autocomplete: "off",
                    placeholder: "The community you live closest to",
                    list: isMobile.value ? "locationListMobile" : "locationList",
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => locationInputProxy.value = $event),
                    onFocus: handleLocationFocus,
                    onBlur: _cache[2] || (_cache[2] = ($event) => commitLocation("blur")),
                    onChange: _cache[3] || (_cache[3] = ($event) => commitLocation("change")),
                    onKeydown: _cache[4] || (_cache[4] = withKeys(withModifiers(($event) => commitLocation("enter"), ["prevent"]), ["enter"])),
                    "aria-invalid": locationTouched.value && locationError.value ? "true" : "false",
                    "aria-describedby": locationTouched.value && locationError.value ? "locationError" : null
                  }, null, 42, _hoisted_9$1), [
                    [vModelText, locationInputProxy.value]
                  ]),
                  hasValidLocationSelection.value ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "location-clear-btn",
                    "aria-label": "Clear selected service region",
                    onMousedown: _cache[5] || (_cache[5] = withModifiers(() => {
                    }, ["prevent"])),
                    onClick: withModifiers(clearLocationSelection, ["prevent"])
                  }, null, 32)) : createCommentVNode("", true)
                ]),
                !isMobile.value ? (openBlock(), createElementBlock("datalist", _hoisted_10$1, [
                  _cache[13] || (_cache[13] = createBaseVNode("option", { value: "All Locations" }, null, -1)),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(locations.value, (loc) => {
                    return openBlock(), createElementBlock("option", {
                      key: loc,
                      value: loc
                    }, null, 8, _hoisted_11$1);
                  }), 128))
                ])) : (openBlock(), createElementBlock("datalist", _hoisted_12$1, [
                  locationQueryIsEmpty.value ? (openBlock(), createElementBlock("option", _hoisted_13$1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    _cache[14] || (_cache[14] = createBaseVNode("option", { value: "All Locations" }, null, -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(mobileLocationOptions.value, (loc) => {
                      return openBlock(), createElementBlock("option", {
                        key: loc,
                        value: loc
                      }, null, 8, _hoisted_14$1);
                    }), 128))
                  ], 64))
                ])),
                locationTouched.value && locationError.value ? (openBlock(), createElementBlock("p", _hoisted_15$1, toDisplayString(locationError.value), 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_16$1, [
                _cache[16] || (_cache[16] = createBaseVNode("label", {
                  for: "nameInput",
                  class: ""
                }, "Filter by company name", -1)),
                createBaseVNode("div", _hoisted_17$1, [
                  withDirectives(createBaseVNode("input", {
                    id: "nameInput",
                    type: "search",
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => nameQuery.value = $event),
                    autocomplete: "organization",
                    placeholder: "Type a company name"
                  }, null, 512), [
                    [
                      vModelText,
                      nameQuery.value,
                      void 0,
                      { trim: true }
                    ]
                  ])
                ])
              ])) : createCommentVNode("", true),
              isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_18$1, [
                _cache[18] || (_cache[18] = createBaseVNode("label", {
                  for: "typeSelect",
                  class: ""
                }, "Choose a type of upgrade", -1)),
                createBaseVNode("div", _hoisted_19$1, [
                  withDirectives(createBaseVNode("select", {
                    onChange: selectIsActive,
                    onClick: withModifiers(selectIsActive, ["prevent"]),
                    onTouchend: selectIsActive,
                    onKeyup: withKeys(selectIsActive, ["esc"]),
                    tabindex: "0",
                    id: "typeSelect",
                    class: "select select--type",
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => selectedUpgradeType.value = $event),
                    required: true,
                    "data-active": "false"
                  }, [
                    _cache[17] || (_cache[17] = createBaseVNode("option", { value: "all" }, "All Upgrade Types", -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(types.value, (type, index) => {
                      return openBlock(), createElementBlock("option", {
                        key: type,
                        value: type
                      }, toDisplayString(type), 9, _hoisted_20$1);
                    }), 128))
                  ], 544), [
                    [vModelSelect, selectedUpgradeType.value]
                  ])
                ])
              ])) : createCommentVNode("", true),
              isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_21$1, [
                _cache[20] || (_cache[20] = createBaseVNode("label", {
                  for: "programSelect",
                  class: ""
                }, "Choose a rebate program", -1)),
                createBaseVNode("div", _hoisted_22$1, [
                  withDirectives(createBaseVNode("select", {
                    onChange: selectIsActive,
                    onClick: withModifiers(selectIsActive, ["prevent"]),
                    onTouchend: selectIsActive,
                    onKeyup: withKeys(selectIsActive, ["esc"]),
                    tabindex: "0",
                    id: "programSelect",
                    class: "select select--program",
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => selectedProgram.value = $event),
                    required: true,
                    "data-active": "false"
                  }, [
                    _cache[19] || (_cache[19] = createBaseVNode("option", { value: "all" }, "All Programs", -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(programs.value, (program, index) => {
                      return openBlock(), createElementBlock("option", {
                        key: program,
                        value: program
                      }, toDisplayString(program), 9, _hoisted_23$1);
                    }), 128))
                  ], 544), [
                    [vModelSelect, selectedProgram.value]
                  ])
                ])
              ])) : createCommentVNode("", true)
            ]),
            isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_24$1, [
              createBaseVNode("p", _hoisted_25, " Showing " + toDisplayString(displayedContractors.value.length) + " of " + toDisplayString(filteredContractors.value.length) + " contractors ", 1),
              createBaseVNode("div", _hoisted_26$1, [
                createBaseVNode("button", {
                  class: "copy-link share",
                  onClick: withModifiers(addLinkToClipboard, ["prevent"]),
                  onKeydown: withKeys(withModifiers(addLinkToClipboard, ["prevent"]), ["enter"]),
                  disabled: !canCopyLink.value,
                  type: "button"
                }, " Share ", 40, _hoisted_27$1),
                _cache[21] || (_cache[21] = createBaseVNode("span", {
                  class: "copy-message isFadedOut",
                  role: "status",
                  "aria-live": "polite"
                }, null, -1))
              ]),
              createBaseVNode("button", {
                class: "clear-filters",
                onClick: withModifiers(clearFilters, ["prevent"]),
                onTouchend: clearFilters,
                onKeydown: withKeys(withModifiers(clearFilters, ["prevent"]), ["enter"]),
                type: "button"
              }, " Reset selection ", 40, _hoisted_28$1)
            ])) : createCommentVNode("", true),
            isVisible.value && 1 !== totalPages.value || 1 < totalPages.value && !isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_29$1, [
              createBaseVNode("button", {
                class: "prev-page",
                onClick: withModifiers(prevPage, ["prevent"]),
                disabled: currentPage.value === 1,
                tabindex: "0",
                type: "button"
              }, "Previous Page", 8, _hoisted_30$1),
              createBaseVNode("span", _hoisted_31$1, [
                _cache[22] || (_cache[22] = createTextVNode("Page ", -1)),
                createBaseVNode("span", _hoisted_32$1, toDisplayString(currentPage.value), 1),
                _cache[23] || (_cache[23] = createTextVNode(" of ", -1)),
                createBaseVNode("span", _hoisted_33$1, toDisplayString(totalPages.value), 1)
              ]),
              createBaseVNode("button", {
                class: "next-page",
                onClick: withModifiers(nextPage, ["prevent"]),
                disabled: currentPage.value === totalPages.value,
                tabindex: "0",
                type: "button"
              }, "Next Page", 8, _hoisted_34$1),
              createBaseVNode("div", _hoisted_35$1, [
                _cache[25] || (_cache[25] = createTextVNode(" Showing ", -1)),
                createBaseVNode("span", _hoisted_36$1, [
                  createBaseVNode("span", _hoisted_37$1, toDisplayString(displayedContractors.value.length), 1),
                  _cache[24] || (_cache[24] = createTextVNode(" of ", -1)),
                  createBaseVNode("span", _hoisted_38$1, toDisplayString(filteredContractors.value.length), 1)
                ]),
                _cache[26] || (_cache[26] = createTextVNode(" registered contractors ", -1))
              ]),
              createBaseVNode("span", _hoisted_39$1, [
                createBaseVNode("span", _hoisted_40$1, [
                  _cache[27] || (_cache[27] = createTextVNode("Showing ", -1)),
                  createBaseVNode("span", _hoisted_41$1, toDisplayString(displayedContractors.value.length), 1),
                  _cache[28] || (_cache[28] = createTextVNode(" of ", -1)),
                  createBaseVNode("span", _hoisted_42$1, toDisplayString(filteredContractors.value.length), 1),
                  createTextVNode(" registered contractors " + toDisplayString(_ctx.currentTypeFilterMessage) + " " + toDisplayString(_ctx.currentLocationFilterMessage) + ".", 1)
                ]),
                createBaseVNode("span", _hoisted_43$1, [
                  _cache[29] || (_cache[29] = createTextVNode("Page ", -1)),
                  createBaseVNode("span", _hoisted_44$1, toDisplayString(currentPage.value), 1),
                  _cache[30] || (_cache[30] = createTextVNode(" of ", -1)),
                  createBaseVNode("span", _hoisted_45$1, toDisplayString(totalPages.value), 1)
                ])
              ]),
              createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          createCommentVNode("", true),
          createBaseVNode("table", _hoisted_49$1, [
            _cache[38] || (_cache[38] = createBaseVNode("caption", { class: "sr-only" }, "Registered Contractors", -1)),
            _cache[39] || (_cache[39] = createBaseVNode("colgroup", null, [
              createBaseVNode("col", { class: "col col--1 odd col--contractor__company-and-location" }),
              createBaseVNode("col", { class: "col col--2 odd col--contractor__email-and-phone" }),
              createBaseVNode("col", { class: "col col--3 even col--contractor__upgrade-types" }),
              createBaseVNode("col", { class: "col col--4 odd col--contractor__program-designations" })
            ], -1)),
            _cache[40] || (_cache[40] = createBaseVNode("thead", null, [
              createBaseVNode("tr", null, [
                createBaseVNode("th", { class: "contractor-heading odd contractor-heading--company-and-location" }, "Company name & head office location"),
                createBaseVNode("th", { class: "contractor-heading odd contractor-heading--email-and-phone" }, "Email & phone"),
                createBaseVNode("th", { class: "contractor-heading even contractor-heading--service-organizations" }, "Upgrade type(s)"),
                createBaseVNode("th", { class: "contractor-heading odd contractor-heading--services" }, "Qualified program(s)")
              ])
            ], -1)),
            createBaseVNode("tbody", {
              ref_key: "resultsTbody",
              ref: resultsTbody,
              class: normalizeClass(`page page--${currentPage.value}`)
            }, [
              filteredContractors.value.length === 0 && !isLoading.value ? (openBlock(), createElementBlock("tr", _hoisted_50$1, [..._cache[36] || (_cache[36] = [
                createBaseVNode("td", { colspan: "100%" }, [
                  createBaseVNode("div", {
                    class: "no-results",
                    role: "status",
                    "aria-live": "polite"
                  }, [
                    createBaseVNode("p", null, "There are currently no registered contractors in your community for the selected program or upgrade. Try searching a nearby community."),
                    createBaseVNode("p", null, [
                      createTextVNode("Contractors who aren't on this list can visit "),
                      createBaseVNode("a", { href: "https://homeperformance.ca/about-the-network/" }, "homeperformance.ca/contractornetwork"),
                      createTextVNode(" to register for Better Homes programs.")
                    ])
                  ])
                ], -1)
              ])])) : createCommentVNode("", true),
              isLoading.value ? (openBlock(), createElementBlock("tr", _hoisted_51$1, [..._cache[37] || (_cache[37] = [
                createBaseVNode("td", { colspan: "100%" }, [
                  createBaseVNode("p", { class: "no-results loading" }, "Retrieving a list of registered contractors, please wait...")
                ], -1)
              ])])) : createCommentVNode("", true),
              contractors.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(displayedContractors.value, (contractor, index) => {
                return openBlock(), createElementBlock("tr", {
                  key: contractor.id || contractor.company_name || index,
                  class: normalizeClass(`contractor result result--${index + 1} ${0 === (index + 1) % 2 ? `even` : `odd`}`)
                }, [
                  createBaseVNode("td", _hoisted_52$1, [
                    createBaseVNode("div", _hoisted_53$1, [
                      contractor.company_website ? (openBlock(), createElementBlock("a", {
                        key: 0,
                        class: "contractor__company external-app-link",
                        href: contractor.company_website,
                        target: "_blank",
                        onClick: ($event) => onProviderLinkClick(contractor),
                        "aria-label": unref(decodeHtmlEntities)(contractor.company_name) + " website, opens in a new tab/window."
                      }, toDisplayString(contractor.company_name ? unref(decodeHtmlEntities)(contractor.company_name) : "Website"), 9, _hoisted_54$1)) : (openBlock(), createElementBlock("span", _hoisted_55$1, toDisplayString(contractor.company_name ? unref(decodeHtmlEntities)(contractor.company_name) : "No company name provided"), 1)),
                      contractor.head_office_location ? (openBlock(), createElementBlock("p", _hoisted_56$1, toDisplayString(contractor.head_office_location ? contractor.head_office_location : "Not provided"), 1)) : createCommentVNode("", true)
                    ])
                  ]),
                  createBaseVNode("td", _hoisted_57$1, [
                    createBaseVNode("div", _hoisted_58$1, [
                      createBaseVNode("div", _hoisted_59$1, [
                        contractor.email ? (openBlock(), createElementBlock("a", {
                          key: 0,
                          class: "contractor__email ellipsis",
                          href: "mailto:" + contractor.email,
                          onClick: withModifiers(($event) => onEmailPhoneClick(contractor, "email"), ["prevent"])
                        }, [
                          createCommentVNode("", true),
                          createTextVNode(toDisplayString(contractor.email), 1)
                        ], 8, _hoisted_60$1)) : (openBlock(), createElementBlock("p", _hoisted_62, "No email provided"))
                      ]),
                      createBaseVNode("div", _hoisted_63, [
                        contractor.phone ? (openBlock(), createElementBlock("a", {
                          key: 0,
                          class: "contractor__telephone",
                          href: "tel:+1" + contractor.phone.replace(/-/g, ""),
                          onClick: withModifiers(($event) => onEmailPhoneClick(contractor, "phone"), ["prevent"])
                        }, toDisplayString(contractor.phone), 9, _hoisted_64$1)) : (openBlock(), createElementBlock("p", _hoisted_65$1, "No phone number provided"))
                      ])
                    ])
                  ]),
                  createBaseVNode("td", _hoisted_66$1, [
                    getVisibleContractorTypeLabels(contractor).length ? (openBlock(), createElementBlock("ul", _hoisted_67$1, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(getVisibleContractorTypeLabels(contractor), (typeLabel) => {
                        return openBlock(), createElementBlock("li", { key: typeLabel }, toDisplayString(typeLabel), 1);
                      }), 128))
                    ])) : createCommentVNode("", true)
                  ]),
                  createBaseVNode("td", _hoisted_68$1, [
                    getVisibleProgramDesignations(contractor).length ? (openBlock(), createElementBlock("ul", _hoisted_69$1, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(getVisibleProgramDesignations(contractor), (d) => {
                        return openBlock(), createElementBlock("li", {
                          key: (d == null ? void 0 : d.id) || (d == null ? void 0 : d.name),
                          class: normalizeClass([d.slug, "has-icon is-uppercase"]),
                          "aria-label": d.name + " qualified"
                        }, toDisplayString(d.slug), 11, _hoisted_70$1);
                      }), 128))
                    ])) : createCommentVNode("", true)
                  ])
                ], 2);
              }), 128)) : createCommentVNode("", true)
            ], 2)
          ])
        ]),
        displayedContractors.value.length && filteredContractors.value.length > displayedContractors.value.length || filteredContractors.value.length !== 0 && 1 !== totalPages.value ? (openBlock(), createElementBlock("div", _hoisted_71$1, [
          displayMode.value === "loadMore" && remainingCount.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_72$1, [
            createBaseVNode("button", {
              type: "button",
              onClick: loadMore,
              ref_key: "loadMoreBtn",
              ref: loadMoreBtn
            }, " Load " + toDisplayString(nextLoadCount.value) + " more contractor" + toDisplayString(nextLoadCount.value === 1 ? "" : "s"), 513),
            createBaseVNode("p", _hoisted_73$1, " Showing " + toDisplayString(displayedContractors.value.length) + " of " + toDisplayString(filteredContractors.value.length), 1)
          ])) : createCommentVNode("", true),
          createCommentVNode("", true)
        ])) : createCommentVNode("", true)
      ], 64);
    };
  }
};
const ContractorFilterApp = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a72dee39"]]);
const HPWH_REBATE_SLUG = "heat-pump-water-heater-rebates";
const normalizeText = (value) => String(value || "").toLowerCase();
const isInsulationOrWindowsPage = (pageRebateTypeText = "") => {
  const text = normalizeText(pageRebateTypeText);
  return text.includes("insulation") || text.includes("window") || text.includes("door");
};
const isHeatPumpRebatePage = ({
  pageRebateClass = "",
  pageRebateTypeText = ""
}) => {
  const pageClass = normalizeText(pageRebateClass);
  const pageType = normalizeText(pageRebateTypeText);
  return pageClass === "heat-pump-rebates" || pageType.includes("heat pump") && !pageType.includes("water heater");
};
const isHeatPumpWaterHeaterRebatePage = ({
  pageRebateClass = "",
  pageRebateTypeText = "",
  hpwhRebateSlug = HPWH_REBATE_SLUG
}) => {
  const pageClass = normalizeText(pageRebateClass);
  const pageType = normalizeText(pageRebateTypeText);
  return pageClass === hpwhRebateSlug || pageType.includes("heat pump water heater");
};
const shouldValidateRoomHeatingField = ({
  isSingleMode = false,
  isHeatPumpWaterHeaterRebatePage: isHpwhPage = false
}) => !isSingleMode || !isHpwhPage;
const shouldValidateWaterHeatingField = ({
  isSingleMode = false,
  isHeatPumpWaterHeaterRebatePage: isHpwhPage = false
}) => !isSingleMode || isHpwhPage;
const shouldForceElectricHpError = ({
  isSingleMode = false,
  selectedHeatingSlug = "",
  pageRebateClass = "",
  pageRebateTypeText = ""
}) => {
  return isSingleMode && selectedHeatingSlug === "electric-hp" && !isInsulationOrWindowsPage(pageRebateTypeText) && isHeatPumpRebatePage({ pageRebateClass, pageRebateTypeText });
};
const shouldForceElectricHpwhError = ({
  isSingleMode = false,
  selectedWaterHeatingSlug = "",
  pageRebateClass = "",
  pageRebateTypeText = ""
}) => {
  return isSingleMode && selectedWaterHeatingSlug === "electric-hpwh" && !isInsulationOrWindowsPage(pageRebateTypeText) && isHeatPumpWaterHeaterRebatePage({ pageRebateClass, pageRebateTypeText });
};
const isGroundOrientedHeatPumpIneligible = ({
  isGodBuilding = false,
  isHighTier = false,
  isHP = false,
  isHPWH = false,
  roomIsWood = false,
  waterIsWood = false
}) => isGodBuilding && isHighTier && (isHP && roomIsWood || isHPWH && waterIsWood);
const normalizeSlug = (value) => String(value || "").trim();
const getRestoredBuildingTypeSlug = ({
  type = "",
  group = "",
  mode = "archive",
  buildingTypeGroups = []
}) => {
  const normalizedType = normalizeSlug(type);
  const normalizedGroup = normalizeSlug(group);
  const childSlugs = /* @__PURE__ */ new Set();
  let allowOtherGroupOption = false;
  for (const buildingGroup of buildingTypeGroups) {
    const groupSlug = normalizeSlug(buildingGroup == null ? void 0 : buildingGroup.slug);
    if (mode !== "single" && groupSlug === "other") {
      allowOtherGroupOption = true;
    }
    for (const child of Array.isArray(buildingGroup == null ? void 0 : buildingGroup.children) ? buildingGroup.children : []) {
      const childSlug = normalizeSlug(child == null ? void 0 : child.slug);
      if (childSlug) childSlugs.add(childSlug);
    }
  }
  if (normalizedType && childSlugs.has(normalizedType)) {
    return normalizedType;
  }
  if (allowOtherGroupOption && (normalizedType === "other" || normalizedGroup === "other")) {
    return "other";
  }
  return "";
};
const _hoisted_1 = {
  key: 0,
  role: "status",
  class: "loader"
};
const _hoisted_2 = {
  key: 1,
  class: "inner"
};
const _hoisted_3 = {
  key: 0,
  class: "sr-only"
};
const _hoisted_4 = {
  key: 1,
  href: "#rebatesResults",
  class: "sr-only skip-to-results"
};
const _hoisted_5 = {
  key: 2,
  role: "status",
  class: "loader"
};
const _hoisted_6 = {
  key: 3,
  role: "alert"
};
const _hoisted_7 = ["aria-hidden", "inert"];
const _hoisted_8 = { class: "dialog-content" };
const _hoisted_9 = { id: "single-mode-dialog-desc" };
const _hoisted_10 = { class: "dialog-actions" };
const _hoisted_11 = {
  class: "wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex",
  style: { "margin-top": "1rem", "margin-bottom": "0rem" }
};
const _hoisted_12 = { class: "guardrails-dialog__actions is-layout-flex" };
const _hoisted_13 = { class: "wp-block-button has-size-regular is-style-outline" };
const _hoisted_14 = {
  key: 0,
  class: "wp-block-button has-size-regular is-style-fill"
};
const _hoisted_15 = ["href"];
const _hoisted_16 = {
  key: 1,
  class: "wp-block-button has-size-regular is-style-fill"
};
const _hoisted_17 = {
  key: 1,
  class: "wp-block-group info has-icon is-layout-flow wp-block-group-is-layout-flow",
  style: { "border-radius": "1rem", "margin": "0", "padding": "0.5rem 1rem" }
};
const _hoisted_18 = { style: { "font-size": "1rem", "margin-block": "0.5rem" } };
const _hoisted_19 = ["onKeydown"];
const _hoisted_20 = { key: 1 };
const _hoisted_21 = {
  id: "single-mode-summary-instructions",
  class: "sr-only"
};
const _hoisted_22 = {
  id: "single-mode-summary-status",
  class: "sr-only",
  role: "status",
  "aria-live": "polite"
};
const _hoisted_23 = ["aria-expanded"];
const _hoisted_24 = {
  id: "single-mode-settings-details-label",
  class: "sr-only"
};
const _hoisted_26 = ["inert", "aria-hidden"];
const _hoisted_27 = {
  key: 0,
  class: "control button-group"
};
const _hoisted_28 = { class: "small" };
const _hoisted_29 = ["disabled", "data-field-key", "aria-label", "aria-describedby", "onClick"];
const _hoisted_30 = ["id"];
const _hoisted_31 = ["id"];
const _hoisted_32 = { key: 1 };
const _hoisted_33 = { class: "control editable" };
const _hoisted_34 = ["disabled", "onClick", "aria-label"];
const _hoisted_35 = ["id", "for"];
const _hoisted_36 = ["id", "aria-describedby", "onUpdate:modelValue", "disabled", "onChange", "onKeydown"];
const _hoisted_37 = ["selected"];
const _hoisted_38 = ["label"];
const _hoisted_39 = ["value"];
const _hoisted_40 = ["value"];
const _hoisted_41 = ["id"];
const _hoisted_42 = ["id", "innerHTML"];
const _hoisted_43 = { key: 3 };
const _hoisted_44 = ["aria-labelledby"];
const _hoisted_45 = ["id"];
const _hoisted_46 = ["id"];
const _hoisted_47 = {
  key: 0,
  class: "rebate-detail-warning"
};
const _hoisted_48 = {
  key: 2,
  class: "control editable"
};
const _hoisted_49 = ["disabled", "onClick", "aria-label"];
const _hoisted_50 = ["id", "for"];
const _hoisted_51 = ["id", "aria-describedby", "onUpdate:modelValue", "disabled", "onChange", "onKeydown"];
const _hoisted_52 = ["selected"];
const _hoisted_53 = ["label"];
const _hoisted_54 = ["value"];
const _hoisted_55 = ["value"];
const _hoisted_56 = ["id"];
const _hoisted_57 = ["id", "innerHTML"];
const _hoisted_58 = { class: "control instruction-group" };
const _hoisted_59 = {
  key: 0,
  class: "small sr-only",
  for: "instructions"
};
const _hoisted_60 = {
  key: 1,
  name: "instructions",
  class: "small-text",
  style: { "text-align": "left", "line-height": "1.665", "padding-top": "0.5rem" }
};
const _hoisted_61 = ["disabled", "aria-label", "title"];
const _hoisted_64 = {
  "aria-live": "polite",
  class: "sr-only",
  role: "status"
};
const _hoisted_65 = { class: "control-container stacked" };
const _hoisted_66 = {
  key: 0,
  class: "question-container"
};
const _hoisted_67 = {
  class: "control",
  role: "none"
};
const _hoisted_68 = ["for"];
const _hoisted_69 = ["href"];
const _hoisted_70 = { class: "custom-input location-input-wrapper" };
const _hoisted_71 = ["list", "id", "aria-invalid", "aria-describedby", "disabled"];
const _hoisted_72 = ["id"];
const _hoisted_73 = ["value"];
const _hoisted_74 = ["id"];
const _hoisted_75 = {
  key: 0,
  value: "Please type to find your community"
};
const _hoisted_76 = ["value"];
const _hoisted_77 = ["innerHTML"];
const _hoisted_78 = { key: 3 };
const _hoisted_79 = { key: 4 };
const _hoisted_80 = { key: 5 };
const _hoisted_81 = ["id", "onUpdate:modelValue", "disabled", "onChange", "onKeydown"];
const _hoisted_82 = ["selected"];
const _hoisted_83 = ["label"];
const _hoisted_84 = ["value"];
const _hoisted_85 = ["value"];
const _hoisted_86 = ["value"];
const _hoisted_87 = { key: 0 };
const _hoisted_88 = { key: 1 };
const _hoisted_89 = { key: 2 };
const _hoisted_90 = ["innerHTML"];
const _hoisted_91 = {
  key: 4,
  class: "eligible-homes-insertion"
};
const _hoisted_92 = {
  key: 1,
  class: "clear-msg"
};
const _hoisted_93 = {
  key: 2,
  class: "clear-msg"
};
const _hoisted_94 = {
  key: 0,
  id: "rebatesResults",
  "aria-label": "Rebate results"
};
const _hoisted_95 = { class: "results-message" };
const _hoisted_96 = { id: "grid-or-list-container" };
const _hoisted_97 = ["aria-label"];
const _hoisted_98 = {
  for: "grid-or-list",
  class: "toggle-label"
};
const _hoisted_99 = { class: "sr-only" };
const _hoisted_100 = ["href", "aria-label"];
const _hoisted_101 = { class: "card-meta" };
const _hoisted_103 = {
  key: 1,
  class: "wp-block-image size-full"
};
const _hoisted_104 = ["src"];
const _hoisted_107 = { class: "rebate-details-container" };
const _hoisted_108 = { class: "rebate-title" };
const _hoisted_109 = { key: 0 };
const _hoisted_110 = { class: "rebate-details" };
const _hoisted_111 = {
  key: 0,
  class: "sr-only"
};
const _hoisted_112 = {
  key: 1,
  class: "rebate-description"
};
const _hoisted_114 = {
  key: 0,
  class: "no-results"
};
const _hoisted_115 = {
  key: 1,
  class: "not-eligible"
};
const _hoisted_116 = {
  key: 2,
  class: "no-results loader"
};
const STORAGE_KEY = "displayGridOrList";
const PREFERRED_SETTINGS_KEY = "preferredSettings";
const REBATE_TOOL_SETTINGS_KEY = "rebateToolSettings";
const ASSISTIVE_SIMPLE_MODE_KEY = "rebateAssistiveSimpleMode";
const SINGLE_MODE_TITLE_PENDING_CLASS = "vnext-single-mode-title-pending";
const SINGLE_MODE_TITLE_TRANSITION_MS = 300;
const heatPumpWaterHeaterRebateSlug = "heat-pump-water-heater-rebates";
const heatPumpRebateSlug = "heat-pump-rebates";
const _sfc_main = {
  __name: "vNextRebateVueApp",
  setup(__props) {
    var _a, _b, _c;
    const publicDomain = /* @__PURE__ */ ref("https://www.betterhomesbc.ca");
    const rebatesAPI = `${((_a = window.site) == null ? void 0 : _a.domain) ? window.site.domain : publicDomain.value}/wp-json/custom/v2/rebates`;
    function runOptionalGlobal(functionName) {
      const candidate = globalThis == null ? void 0 : globalThis[functionName];
      if (typeof candidate === "function") {
        candidate();
      }
    }
    const initialSourceParam = (() => {
      if (typeof window === "undefined") return "";
      try {
        return String(
          new URLSearchParams(window.location.search).get("source") || ""
        ).trim().toLowerCase();
      } catch (e) {
        return "";
      }
    })();
    const api = /* @__PURE__ */ ref({
      "settings-selects": {
        "building-types": [],
        "home-value": [],
        "income-bands": [],
        locations: [],
        utilities: []
      },
      results: []
    });
    const isLoading = /* @__PURE__ */ ref(true);
    const loadError = /* @__PURE__ */ ref("");
    const isSingleModeTitleAwaitingAjax = /* @__PURE__ */ ref(false);
    const displayGridOrList = /* @__PURE__ */ ref(true);
    const viewPreferenceLoaded = /* @__PURE__ */ ref(false);
    let singleModeTitleRevealFrame = 0;
    let singleModeTitleSwapTimeout = 0;
    if (typeof document !== "undefined") {
      const initialAppMode = ((_c = (_b = document.getElementById("vnextRebateFilterApp")) == null ? void 0 : _b.dataset) == null ? void 0 : _c.mode) || "";
      if (initialAppMode === "single") {
        document.documentElement.classList.add(SINGLE_MODE_TITLE_PENDING_CLASS);
      }
    }
    function persistDisplayViewPreference() {
      localStorage.setItem(STORAGE_KEY, String(displayGridOrList.value));
    }
    function onViewToggleChange() {
      persistDisplayViewPreference();
    }
    function toggleViewWithKeyboard() {
      displayGridOrList.value = !displayGridOrList.value;
      persistDisplayViewPreference();
    }
    function readPreferredSettings() {
      try {
        const raw = localStorage.getItem(PREFERRED_SETTINGS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch (e) {
        return {};
      }
    }
    function writePreferredSettings(partial) {
      try {
        const prev = readPreferredSettings();
        const next = {
          ...prev,
          ...partial,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        localStorage.setItem(PREFERRED_SETTINGS_KEY, JSON.stringify(next));
      } catch (e) {
      }
    }
    function readRebateToolSettings() {
      try {
        const raw = localStorage.getItem(REBATE_TOOL_SETTINGS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (e) {
        return null;
      }
    }
    function hydratePreferredSettingsFromRebateToolSettings() {
      var _a2, _b2, _c2, _d, _e;
      const saved = readRebateToolSettings();
      const preferred = readPreferredSettings();
      let locMatch = selectedLocationSlug.value && locationOptionsForInput.value.find(
        (l) => l.slug === selectedLocationSlug.value
      ) || selectedLocationName.value && locationOptionsForInput.value.find(
        (l) => l.name === selectedLocationName.value
      ) || null;
      if (!locMatch && (saved == null ? void 0 : saved.location)) {
        locMatch = locationOptionsForInput.value.find(
          (l) => l.slug === saved.location
        ) || locationOptionsForInput.value.find(
          (l) => l.name === saved.location
        ) || null;
      }
      if (locMatch) {
        const nextSlug = locMatch.slug;
        const currentSlug = ((_a2 = preferred == null ? void 0 : preferred.location) == null ? void 0 : _a2.slug) || "";
        if (nextSlug && nextSlug !== currentSlug) {
          writePreferredSettings({
            location: {
              slug: locMatch.slug,
              name: locMatch.name,
              region: ((_c2 = (_b2 = locMatch.children) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.name) || "",
              region_slug: ((_e = (_d = locMatch.children) == null ? void 0 : _d[0]) == null ? void 0 : _e.slug) || ""
            }
          });
        }
      }
      const tier = espTier.value;
      if (tier) {
        if ((preferred == null ? void 0 : preferred.esp_tier) !== tier) {
          writePreferredSettings({ esp_tier: tier });
        }
      }
    }
    function debounce(fn, delay = 500) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }
    const singleModeDebugEnabled = computed(() => {
      if (typeof window === "undefined") return false;
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("single_mode_debug") === "1" || window.localStorage.getItem("singleModeDebug") === "1";
      } catch (e) {
        return false;
      }
    });
    function logSingleModeDebug(event, extra = {}) {
      var _a2;
      if (!singleModeDebugEnabled.value) return;
      const payload = {
        event,
        mode: mode.value,
        isReadyToRender: isReadyToRender.value,
        hasInitialQuery: singleModeHasInitialQueryString.value,
        pageKind: singleModePageRebateKind.value,
        primaryFieldsComplete: singleModePrimaryFieldsCompleteForCurrentPage.value,
        currentPageInVerifiedResults: singleModeCurrentPageInVerifiedResults.value,
        queryInvalidOnLoad: singleModeQueryInvalidOnPageLoad.value,
        currentPath: currentPagePathname.value,
        alternateCount: singleModeAlternateRebateOptions.value.length,
        alternateHref: ((_a2 = singleModeAlternateRebate.value) == null ? void 0 : _a2.href) || "",
        selected: {
          buildingGroup: selectedBuildingGroupSlug.value,
          heating: selectedHeatingSlug.value,
          waterHeating: selectedWaterHeatingSlug.value
        },
        ...extra
      };
      console.groupCollapsed(`[single-mode-debug] ${event}`);
      console.table(payload);
      console.groupEnd();
    }
    const debouncedUpdateRebateDetails = debounce(updateRebateDetails, 500);
    const isAjaxLoading = /* @__PURE__ */ ref(false);
    function getAjaxStyleSignature(node) {
      if (!(node instanceof Element)) return "";
      if (node.tagName === "LINK") {
        const rel = String(node.getAttribute("rel") || "").toLowerCase();
        const href = String(node.getAttribute("href") || "").trim();
        if (!href) return "";
        return `link:${rel}:${href}`;
      }
      if (node.tagName === "STYLE") {
        const id = String(node.getAttribute("id") || "").trim();
        if (id) return `style:id:${id}`;
        const media = String(node.getAttribute("media") || "").trim();
        const text = String(node.textContent || "").trim();
        if (!text) return "";
        return `style:inline:${media}:${text}`;
      }
      return "";
    }
    function syncFetchedDocumentStyles(doc2) {
      if (!(doc2 instanceof Document)) return;
      const fetchedStyleNodes = [
        ...doc2.querySelectorAll(
          'head style, head link[rel~="stylesheet"], body style, body link[rel~="stylesheet"]'
        )
      ];
      if (!fetchedStyleNodes.length) return;
      const existingSignatures = new Set(
        [
          ...document.querySelectorAll(
            'head style, head link[rel~="stylesheet"], body style, body link[rel~="stylesheet"]'
          )
        ].map(getAjaxStyleSignature).filter(Boolean)
      );
      for (const styleNode of fetchedStyleNodes) {
        const signature = getAjaxStyleSignature(styleNode);
        if (!signature || existingSignatures.has(signature)) continue;
        const clone = styleNode.cloneNode(true);
        document.head.appendChild(clone);
        existingSignatures.add(signature);
      }
    }
    async function updateRebateDetails() {
      var _a2;
      const targetSelector = "#rebate-details-container";
      const container = document.querySelector(targetSelector);
      if (!container) return;
      let didSyncTitleAfterRefresh = false;
      const titleEl = document.querySelector(".subtitle");
      const nextTitleTarget = titleEl ? getSingleModeHeatingTitleTarget(titleEl) : null;
      const currentTitleSignature = ((_a2 = titleEl == null ? void 0 : titleEl.dataset) == null ? void 0 : _a2.singleModeTitleSignature) || "";
      const shouldAnimateTitleSwap = mode.value === "single" && Boolean(nextTitleTarget == null ? void 0 : nextTitleTarget.signature) && Boolean(currentTitleSignature) && currentTitleSignature !== nextTitleTarget.signature;
      try {
        if (shouldAnimateTitleSwap) {
          setSingleModeHeatingTitleVisibility(false);
        }
        isAjaxLoading.value = true;
        const res = await fetch(assembledUrl.value, {
          credentials: "same-origin"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const parser = new DOMParser();
        const doc2 = parser.parseFromString(html, "text/html");
        const newContent = doc2.querySelector(targetSelector);
        if (newContent) {
          syncFetchedDocumentStyles(doc2);
          container.innerHTML = newContent.innerHTML;
          container.querySelectorAll("script").forEach((oldScript) => {
            const newScript = document.createElement("script");
            if (oldScript.src) {
              newScript.src = oldScript.src;
            } else {
              newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
            document.body.removeChild(newScript);
          });
          window.history.replaceState(null, "", assembledUrl.value);
          syncCurrentQueryStringFromWindow();
          isExternalDirty.value = false;
          isSavingEditMode.value = false;
          lastChangedField.value = "";
          rerenderScrollMenu();
          nextTick(() => runOptionalGlobal("cleanbcdxBhTablesPattern"));
          nextTick(() => runOptionalGlobal("cleanbcdxBhDefinitions"));
          nextTick(
            () => runOptionalGlobal("cleanbcdxBhRebatesArchiveLoader")
          );
          nextTick(
            () => runOptionalGlobal("betterhomesRebatesExternalLinkCheck")
          );
          nextTick(() => runOptionalGlobal("cleanbcdxBhAccessibility"));
          isSingleModeTitleAwaitingAjax.value = false;
          nextTick(() => queueHeatingTitleUpdate());
          didSyncTitleAfterRefresh = true;
        }
      } catch (err) {
        console.error("Failed to update rebate details via AJAX:", err);
        isSingleModeTitleAwaitingAjax.value = false;
        nextTick(() => queueHeatingTitleUpdate());
        didSyncTitleAfterRefresh = true;
      } finally {
        if (!didSyncTitleAfterRefresh) {
          isSingleModeTitleAwaitingAjax.value = false;
          nextTick(() => queueHeatingTitleUpdate());
        }
        isAjaxLoading.value = false;
      }
    }
    function rerenderScrollMenu() {
      const detailsContainer = document.querySelector(
        "#incentive-details-container"
      );
      const sideNav = document.querySelector("#incentive-side-nav");
      if (!detailsContainer || !sideNav) return;
      sideNav.innerHTML = "";
      const headings = detailsContainer.querySelectorAll("h2[id]");
      const navListContainer = document.createElement("nav");
      navListContainer.classList.add(
        "side-nav",
        "bb-nav",
        "wp-block-navigation",
        "is-vertical",
        "wp-container-core-navigation-layout-2"
      );
      const navList = document.createElement("ul");
      navList.classList.add(
        "side-nav",
        "bb-nav",
        "wp-block-navigation",
        "is-vertical",
        "wp-block-navigation__container"
      );
      headings.forEach((heading) => {
        const id = heading.id;
        const text = heading.textContent.trim();
        const listItem = document.createElement("li");
        listItem.classList.add(
          "wp-block-navigation-item",
          "wp-block-navigation-link"
        );
        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = text;
        link.classList.add("wp-block-navigation-item__content");
        listItem.appendChild(link);
        navList.appendChild(listItem);
      });
      navListContainer.appendChild(navList);
      sideNav.appendChild(navListContainer);
      sideNav.classList.remove("admin-instructions");
    }
    const editable = /* @__PURE__ */ ref(false);
    const activeEdit = /* @__PURE__ */ ref("");
    const labelsVisible = /* @__PURE__ */ ref(true);
    const showReadOnlyFields = /* @__PURE__ */ ref(true);
    const showEditModeUI = /* @__PURE__ */ ref(false);
    const editModeView = /* @__PURE__ */ ref(false);
    const singleModeEditModePreference = /* @__PURE__ */ ref(false);
    const isCollapseView = /* @__PURE__ */ ref(true);
    const isSavingEditMode = /* @__PURE__ */ ref(false);
    const ariaStatusMessage = /* @__PURE__ */ ref("");
    const hasArchiveAutoScrolledToResults = /* @__PURE__ */ ref(false);
    const pageHeatingType = /* @__PURE__ */ ref("");
    const pageHeatingTypes = /* @__PURE__ */ ref([]);
    const pageWaterHeatingType = /* @__PURE__ */ ref("");
    const pageWaterHeatingTypes = /* @__PURE__ */ ref([]);
    const pageBuildingGroup = /* @__PURE__ */ ref("");
    const pageRebateType = /* @__PURE__ */ ref("");
    const mode = /* @__PURE__ */ ref("archive");
    const singleModeRebateTypeClass = /* @__PURE__ */ ref("");
    const isReadyToRender = /* @__PURE__ */ ref(false);
    const singleModeDialogRef = /* @__PURE__ */ ref(null);
    const singleModeDialogHeadingRef = /* @__PURE__ */ ref(null);
    const singleModeDialogVariant = /* @__PURE__ */ ref("");
    const isSingleModeDialogOpen = /* @__PURE__ */ ref(false);
    const singleModeDialogLastFocusedEl = /* @__PURE__ */ ref(null);
    const collapseButtonRef = /* @__PURE__ */ ref(null);
    const resetSimplifiedButtonRef = /* @__PURE__ */ ref(null);
    const singleModeSettingsContextMessage = /* @__PURE__ */ ref("");
    const assistiveSimpleMode = /* @__PURE__ */ ref(false);
    const singleModeHasInitialQueryString = /* @__PURE__ */ ref(null);
    const singleModePageLoadDialogHandled = /* @__PURE__ */ ref(false);
    const singleModePageLoadDialogChecking = /* @__PURE__ */ ref(false);
    const singleModeFirstFilterChangeChecking = /* @__PURE__ */ ref(false);
    const singleModePendingFilterChangeCheck = /* @__PURE__ */ ref(false);
    const singleModeQueuedChangeField = /* @__PURE__ */ ref("");
    const singleModeAlternateDialogChangeField = /* @__PURE__ */ ref("");
    const singleModeAlternateDialogSource = /* @__PURE__ */ ref("");
    const singleModeSourceParam = /* @__PURE__ */ ref(initialSourceParam);
    const singleModeOpenFromPlannerSource = computed(
      () => singleModeSourceParam.value === "planner"
    );
    const selectRefs = /* @__PURE__ */ ref({});
    const buttonRefs = /* @__PURE__ */ ref({});
    const lastChangedField = /* @__PURE__ */ ref("");
    const fieldRenderKeys = /* @__PURE__ */ ref({
      homeValue: 0,
      income: 0
    });
    const isHpwhRebatePage = computed(
      () => pageRebateType.value.toLowerCase().includes("heat pump water heater rebates")
    );
    const normalizeHeatingSlug = (val) => {
      if (!val) return "";
      const v = val.toLowerCase().trim();
      if (v.includes("gas")) return "gas";
      if (v.includes("oil")) return "oil";
      if (v.includes("wood")) return "wood";
      if (v.includes("electric")) return "electricity";
      return v.replace(/\s+/g, "-");
    };
    const extractHeatingTokens = (val) => {
      if (!val) return [];
      const v = String(val).toLowerCase();
      const tokens = [];
      if (v.includes("gas")) tokens.push("gas");
      if (v.includes("oil")) tokens.push("oil");
      if (v.includes("wood")) tokens.push("wood");
      if (v.includes("electric")) tokens.push("electricity");
      if (tokens.length > 0) return Array.from(new Set(tokens));
      return [normalizeHeatingSlug(val)];
    };
    const normalizeHeatingTitleKey = (value) => {
      const raw = String(value || "").toLowerCase().trim();
      if (!raw) return "";
      if (raw === "electric-hpwh" || raw.includes("electric heat pump water heater"))
        return "electric-hpwh";
      if (raw === "electric-hp" || raw.includes("electric heat pump"))
        return "electric-hp";
      if (raw === "other" || raw.includes("other") || raw.includes("unsure"))
        return "other";
      if (raw.includes("gas") || raw.includes("propane")) return "gas";
      if (raw.includes("oil")) return "oil";
      if (raw.includes("wood")) return "wood";
      if (raw.includes("electric")) return "electricity";
      return raw.replace(/\s+/g, "-");
    };
    const extractHeatingTitleKeys = (value) => {
      if (!value) return [];
      const raw = String(value).toLowerCase();
      const tokens = [];
      if (raw.includes("electric heat pump water heater"))
        tokens.push("electric-hpwh");
      if (raw.includes("electric heat pump")) tokens.push("electric-hp");
      if (raw.includes("gas") || raw.includes("propane")) tokens.push("gas");
      if (raw.includes("oil")) tokens.push("oil");
      if (raw.includes("wood")) tokens.push("wood");
      if (raw.includes("other") || raw.includes("unsure")) tokens.push("other");
      if (raw.includes("electric") && !raw.includes("electric heat pump") && !raw.includes("electric heat pump water heater")) {
        tokens.push("electricity");
      }
      if (tokens.length > 0) return Array.from(new Set(tokens));
      return [normalizeHeatingTitleKey(value)];
    };
    const resolvedPageWaterHeatingSources = computed(() => {
      if (Array.isArray(pageWaterHeatingTypes.value) && pageWaterHeatingTypes.value.length > 0) {
        return pageWaterHeatingTypes.value.filter(Boolean);
      }
      return String(pageWaterHeatingType.value || "").split(",").map((item) => item.trim()).filter(Boolean);
    });
    const fieldErrors = computed(() => {
      const heatingOptionsSet = pageHeatingTypes.value.length > 0;
      const shouldValidateHeating = heatingOptionsSet && !isHpwhRebatePage.value;
      const shouldValidateWaterHeating = resolvedPageWaterHeatingSources.value.length > 0 && isHpwhRebatePage.value;
      const shouldValidateBuildingGroup = !!pageBuildingGroup.value;
      const normalizedSelectedHeating = normalizeHeatingSlug(
        selectedHeatingSlug.value || selectedHeatingName.value
      );
      const normalizedSelectedWaterHeating = normalizeHeatingSlug(
        selectedWaterHeatingSlug.value || selectedWaterHeatingName.value
      );
      const allowedHeatingTypes = Array.isArray(pageHeatingTypes.value) ? pageHeatingTypes.value.flatMap((item) => extractHeatingTokens(item)).filter(Boolean) : [];
      const allowedWaterHeatingTypes = resolvedPageWaterHeatingSources.value.flatMap((item) => extractHeatingTokens(item)).filter(Boolean);
      const pageRebateWaterHeatingTokens = extractHeatingTokens(
        pageRebateType.value
      );
      const pagePathWaterHeatingTokens = typeof window !== "undefined" ? extractHeatingTokens(window.location.pathname) : [];
      const resolvedWaterHeatingTypes = Array.from(
        /* @__PURE__ */ new Set([
          ...allowedWaterHeatingTypes,
          ...pageRebateWaterHeatingTokens,
          ...pagePathWaterHeatingTokens
        ])
      );
      const isSingleMode = mode.value === "single";
      const pageRebateTypeText = String(pageRebateType.value || "").toLowerCase();
      const pageRebateClass = String(
        singleModeRebateTypeClass.value || ""
      ).toLowerCase();
      const isHeatPumpWaterHeaterPage = isHeatPumpWaterHeaterRebatePage({
        pageRebateClass,
        pageRebateTypeText,
        hpwhRebateSlug: heatPumpWaterHeaterRebateSlug
      });
      const validateRoomHeatingField = shouldValidateRoomHeatingField({
        isSingleMode,
        isHeatPumpWaterHeaterRebatePage: isHeatPumpWaterHeaterPage
      });
      const validateWaterHeatingField = shouldValidateWaterHeatingField({
        isSingleMode,
        isHeatPumpWaterHeaterRebatePage: isHeatPumpWaterHeaterPage
      });
      const forceHeatingElectricHpError = shouldForceElectricHpError({
        isSingleMode,
        selectedHeatingSlug: selectedHeatingSlug.value,
        pageRebateClass,
        pageRebateTypeText
      });
      const forceWaterElectricHpwhError = shouldForceElectricHpwhError({
        isSingleMode,
        selectedWaterHeatingSlug: selectedWaterHeatingSlug.value,
        pageRebateClass,
        pageRebateTypeText
      });
      return {
        location: !isLocationFocused.value && !isLocationValid.value && !!locationInputValue.value,
        // murbTenure:
        //   false &&
        //   selectedBuildingGroupSlug.value === 'ground-oriented-dwellings' &&
        //   murbTenure.value === 'rent',
        building: selectedBuildingTypeSlug.value === "other" || shouldValidateBuildingGroup && !!selectedBuildingGroupSlug.value && selectedBuildingGroupSlug.value !== pageBuildingGroup.value,
        heating: validateRoomHeatingField && selectedHeatingSlug.value === "other" || forceHeatingElectricHpError || shouldValidateHeating && !!selectedHeatingSlug.value && !allowedHeatingTypes.includes(normalizedSelectedHeating),
        water: validateWaterHeatingField && selectedWaterHeatingSlug.value === "other" || forceWaterElectricHpwhError || shouldValidateWaterHeating && !!selectedWaterHeatingSlug.value && !resolvedWaterHeatingTypes.includes(
          normalizedSelectedWaterHeating
        ),
        utility: selectedUtilitySlug.value === "other"
        // gas: selectedGasSlug.value === 'other'
      };
    });
    const normalizeRebateLabel = (val) => String(val || "").toLowerCase().replace(/\s+/g, " ").trim();
    const toSentenceCase = (val) => {
      const text = String(val || "").trim();
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };
    const toA11yText = (val) => String(val || "").replace(/\s+/g, " ").trim();
    function getFieldErrorDescription(field) {
      if (!(field == null ? void 0 : field.error_desc)) return "";
      if (mode.value === "single" && field.key === "heating" && selectedHeatingSlug.value === "other") {
        return 'Only the listed heating types are currently eligible for Better Homes rebates. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> to find out if your heating type fits into one of these categories.';
      }
      if (mode.value === "single" && field.key === "water" && selectedWaterHeatingSlug.value === "other") {
        return 'Only the listed water heating types are currently eligible for Better Homes rebates. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> to find out if your water heating type fits into one of these categories.';
      }
      return field.error_desc;
    }
    function getEditFieldButtonLabel(field) {
      const fieldName = toA11yText((field == null ? void 0 : field.shortDesc) || (field == null ? void 0 : field.label) || "setting");
      const value = toA11yText((field == null ? void 0 : field.displayValue) || "");
      if (!fieldName) return "Edit setting";
      if (!value) return `Edit ${fieldName}`;
      return `Edit ${fieldName}. Current value: ${value}.`;
    }
    const singleModePageEligible = computed(() => {
      if (mode.value !== "single") return true;
      const pageClass = normalizeRebateLabel(singleModeRebateTypeClass.value);
      const pageType = normalizeRebateLabel(pageRebateType.value);
      if (!pageClass && !pageType) return true;
      return filteredResults.value.some((item) => {
        const itemClass = normalizeRebateLabel(item.rebate_type_class);
        const itemHeadline = normalizeRebateLabel(
          item.rebate_type_headline_card
        );
        const itemTitle = normalizeRebateLabel(item.title);
        if (pageClass && itemClass === pageClass) return true;
        if (pageType && (itemHeadline.includes(pageType) || itemTitle.includes(pageType))) {
          return true;
        }
        return false;
      });
    });
    const singleModePageRebateKind = computed(() => {
      const pageRebateClass = String(
        singleModeRebateTypeClass.value || ""
      ).toLowerCase();
      const pageRebateTypeText = String(pageRebateType.value || "").toLowerCase();
      const isHeatPumpWaterHeaterPage = isHeatPumpWaterHeaterRebatePage({
        pageRebateClass,
        pageRebateTypeText,
        hpwhRebateSlug: heatPumpWaterHeaterRebateSlug
      });
      if (isHeatPumpWaterHeaterPage) return "hpwh";
      const isHeatPumpPage = isHeatPumpRebatePage({
        pageRebateClass,
        pageRebateTypeText
      });
      if (isHeatPumpPage) return "hp";
      return "";
    });
    const normalizedSelectedRoomHeatingForAlternate = computed(
      () => normalizeHeatingSlug(selectedHeatingSlug.value || selectedHeatingName.value)
    );
    const normalizedSelectedWaterHeatingForAlternate = computed(
      () => normalizeHeatingSlug(
        selectedWaterHeatingSlug.value || selectedWaterHeatingName.value
      )
    );
    const normalizedSelectedBuildingGroupForAlternate = computed(
      () => String(selectedBuildingGroupSlug.value || "").toLowerCase().trim()
    );
    const currentPagePathname = computed(
      () => typeof window !== "undefined" ? String(window.location.pathname || "") : ""
    );
    const currentPageRebateItem = computed(() => {
      const pagePath = currentPagePathname.value;
      if (!pagePath) return null;
      return api.value.results.find((item) => {
        const rawUrl = (item == null ? void 0 : item.post_url) ?? (item == null ? void 0 : item.url) ?? "";
        if (!rawUrl) return false;
        try {
          const itemPath = new URL(rawUrl, window.location.origin).pathname;
          return itemPath === pagePath;
        } catch (e) {
          return false;
        }
      }) || null;
    });
    const currentPageAllowedTypeSlugsForAlternate = computed(() => {
      var _a2;
      const fromDataset = String(pageBuildingGroup.value || "").toLowerCase().trim();
      if (fromDataset) return [fromDataset];
      const itemTypes = Array.isArray((_a2 = currentPageRebateItem.value) == null ? void 0 : _a2.types) ? currentPageRebateItem.value.types.map(
        (t) => String((t == null ? void 0 : t.slug) || "").toLowerCase().trim()
      ).filter(Boolean) : [];
      return itemTypes;
    });
    const currentPageTypeEligibleForAlternate = computed(() => {
      const pageGroups = currentPageAllowedTypeSlugsForAlternate.value;
      if (pageGroups.length === 0) return true;
      if (!normalizedSelectedBuildingGroupForAlternate.value) return false;
      return pageGroups.includes(
        normalizedSelectedBuildingGroupForAlternate.value
      );
    });
    const currentPageRoomHeatingEligibleForAlternate = computed(() => {
      const selected = normalizedSelectedRoomHeatingForAlternate.value;
      if (!selected) return false;
      const allowed = Array.isArray(pageHeatingTypes.value) ? pageHeatingTypes.value.flatMap((item) => extractHeatingTokens(item)).filter(Boolean) : [];
      if (allowed.length === 0) return true;
      return allowed.includes(selected);
    });
    const currentPageWaterHeatingEligibleForAlternate = computed(() => {
      const selected = normalizedSelectedWaterHeatingForAlternate.value;
      if (!selected) return false;
      const allowed = resolvedPageWaterHeatingSources.value.flatMap((item) => extractHeatingTokens(item)).filter(Boolean);
      if (allowed.length === 0) return true;
      return allowed.includes(selected);
    });
    const singleModePrimaryFieldsCompleteForCurrentPage = computed(() => {
      if (mode.value !== "single") return false;
      if (!normalizedSelectedBuildingGroupForAlternate.value) return false;
      if (singleModePageRebateKind.value === "hp") {
        return !!normalizedSelectedRoomHeatingForAlternate.value;
      }
      if (singleModePageRebateKind.value === "hpwh") {
        return !!normalizedSelectedWaterHeatingForAlternate.value;
      }
      return false;
    });
    const singleModeAlternateRebateOptions = computed(() => {
      if (mode.value !== "single") return [];
      if (singleModePageRebateKind.value === "") return [];
      const currentPath = currentPagePathname.value;
      const seen = /* @__PURE__ */ new Set();
      return filteredResults.value.reduce((acc, item, index) => {
        const itemClass = normalizeRebateLabel(item.rebate_type_class);
        const isSameType = singleModePageRebateKind.value === "hp" && itemClass === heatPumpRebateSlug || singleModePageRebateKind.value === "hpwh" && itemClass === heatPumpWaterHeaterRebateSlug;
        if (!isSameType) return acc;
        const rawUrl = item.post_url ?? item.url ?? "";
        if (!rawUrl) return acc;
        let normalizedPath = "";
        try {
          const urlObj = new URL(rawUrl, window.location.origin);
          normalizedPath = urlObj.pathname;
        } catch (e) {
        }
        if (normalizedPath && normalizedPath === currentPath) return acc;
        if (seen.has(rawUrl)) return acc;
        const headline = item.rebate_type_headline_card || item.title || "Rebate page";
        const subtitle = item.rebate_type_headline_card && !item.rebate_type_headline_card.includes("Insulation") && !item.rebate_type_headline_card.includes("Window") ? item.title : "";
        const combinedRaw = subtitle ? `${headline} ${subtitle.toLowerCase()}` : headline;
        acc.push({
          key: item.id ?? `${index}-${rawUrl}`,
          href: withQueryString(rawUrl, { state: "valid" }),
          combinedSentence: toSentenceCase(combinedRaw)
        });
        seen.add(rawUrl);
        return acc;
      }, []);
    });
    const singleModeCurrentPageInVerifiedResults = computed(() => {
      const currentPath = currentPagePathname.value;
      if (!currentPath) return false;
      return filteredResults.value.some((item) => {
        const rawUrl = item.post_url ?? item.url ?? "";
        if (!rawUrl) return false;
        try {
          const itemPath = new URL(rawUrl, window.location.origin).pathname;
          return itemPath === currentPath;
        } catch (e) {
          return false;
        }
      });
    });
    const singleModeCurrentPageMismatchField = computed(() => {
      if (mode.value !== "single") return "";
      if (!singleModePrimaryFieldsCompleteForCurrentPage.value) return "";
      if (singleModeCurrentPageInVerifiedResults.value) return "";
      if (!currentPageTypeEligibleForAlternate.value) {
        return "building";
      }
      if (singleModePageRebateKind.value === "hp") {
        return currentPageRoomHeatingEligibleForAlternate.value ? "" : "heating";
      }
      if (singleModePageRebateKind.value === "hpwh") {
        return currentPageWaterHeatingEligibleForAlternate.value ? "" : "water";
      }
      return "";
    });
    const singleModeQueryInvalidOnPageLoad = computed(() => {
      if (mode.value !== "single") return false;
      if (singleModeHasInitialQueryString.value === null) return false;
      if (!singleModeHasInitialQueryString.value) return false;
      if (!hasAllSelection.value) return false;
      if (!singleModePrimaryFieldsCompleteForCurrentPage.value) return false;
      return !singleModeCurrentPageInVerifiedResults.value;
    });
    const singleModeAlternateRebate = computed(
      () => singleModeAlternateRebateOptions.value.length > 0 ? singleModeAlternateRebateOptions.value[0] : null
    );
    const singleModeShouldSuppressInvalidQueryModal = computed(
      () => mode.value === "single" && Boolean(currentPageRebateItem.value)
    );
    const singleModeDialogTitle = computed(() => {
      if (singleModeDialogVariant.value === "alternate-rebate") {
        const field = singleModeAlternateDialogChangeField.value;
        const label = field === "building" ? "home" : field === "water" ? "water heating" : field === "heating" ? "heating" : "home";
        if (singleModeAlternateDialogSource.value === "load-mismatch") {
          return `This isn't your ${label} type`;
        }
        if (singleModeAlternateDialogSource.value !== "change") {
          return "You aren’t eligible for these rebates";
        }
        return `You changed the ${label} type`;
      }
      return "Your home details don’t match this rebate";
    });
    const singleModeDialogDescription = computed(() => {
      var _a2;
      if (singleModeDialogVariant.value === "alternate-rebate") {
        if (singleModeAlternateDialogSource.value === "load-mismatch") {
          const field = singleModeAlternateDialogChangeField.value;
          const label = field === "building" ? "home" : field === "water" ? "water heating" : field === "heating" ? "heating" : "home";
          return `This rebate is for a different ${label} type than the one in your details.`;
        }
        if (singleModeAlternateDialogSource.value === "change") {
          const pageTitle = String(
            ((_a2 = currentPageRebateItem.value) == null ? void 0 : _a2.title) || pageRebateType.value || ""
          ).trim().toLowerCase() || "this rebate page";
          return `Rebates are organized by home and heating type. This rebate is for ${pageTitle}.`;
        }
        return "Rebates are organized by heating and home type.";
      }
      return "Rebates are organized by home and heating type.";
    });
    const singleModeAlternateButtonLabel = computed(() => {
      if (singleModeAlternateDialogSource.value === "load-mismatch") {
        const field2 = singleModeAlternateDialogChangeField.value;
        const label2 = field2 === "building" ? "home" : field2 === "water" ? "water heating" : field2 === "heating" ? "heating" : "home";
        return `See rebates for your ${label2} type`;
      }
      if (singleModeAlternateDialogSource.value !== "change") {
        return "Continue to an eligble rebate";
      }
      const field = singleModeAlternateDialogChangeField.value;
      const label = field === "building" ? "home" : field === "water" ? "water heating" : field === "heating" ? "heating" : "home";
      return `Go to the rebate for the new ${label} type`;
    });
    const hasAnyError = computed(() => {
      const hasFieldError = Object.values(fieldErrors.value).some(Boolean);
      const hasNoResults = hasAllSelection.value && 0 === filteredResults.value.length;
      return hasFieldError || hasNoResults;
    });
    function setSingleModeDialogScrollLock(isLocked) {
      const html = document.documentElement;
      const body = document.body;
      if (!html || !body) return;
      if (isLocked) {
        html.style.overflow = "hidden";
        body.style.margin = "0";
        body.style.height = "100%";
        body.style.overflow = "hidden";
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        return;
      }
      html.style.overflow = "";
      body.style.margin = "";
      body.style.height = "";
      body.style.overflow = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
    }
    function openSingleModeDialog() {
      const dialog = singleModeDialogRef.value;
      if (!dialog || dialog.open) return false;
      try {
        const activeEl = document.activeElement;
        singleModeDialogLastFocusedEl.value = activeEl instanceof HTMLElement ? activeEl : null;
        setSingleModeDialogScrollLock(true);
        dialog.showModal();
        isSingleModeDialogOpen.value = true;
        nextTick(() => {
          var _a2, _b2;
          (_b2 = (_a2 = singleModeDialogHeadingRef.value) == null ? void 0 : _a2.focus) == null ? void 0 : _b2.call(_a2);
        });
        return true;
      } catch (e) {
        setSingleModeDialogScrollLock(false);
        isSingleModeDialogOpen.value = false;
        return false;
      }
    }
    function openSingleModeDialogVariant(variant) {
      if (!variant) return;
      if (mode.value === "single" && !hasAllSelection.value) {
        logSingleModeDebug("dialog-open-blocked:form-incomplete", { variant });
        return;
      }
      const dialog = singleModeDialogRef.value;
      if (dialog == null ? void 0 : dialog.open) return;
      if (variant !== "alternate-rebate") {
        singleModeAlternateDialogChangeField.value = "";
        singleModeAlternateDialogSource.value = "";
      }
      singleModeDialogVariant.value = variant;
      nextTick(() => {
        openSingleModeDialog();
      });
    }
    function closeSingleModeDialog(e) {
      var _a2;
      (_a2 = e == null ? void 0 : e.preventDefault) == null ? void 0 : _a2.call(e);
      const dialog = singleModeDialogRef.value;
      if (dialog == null ? void 0 : dialog.open) {
        dialog.close();
      }
    }
    function handleSingleModeDialogBackdropClick(e) {
      const dialog = singleModeDialogRef.value;
      if (!dialog || !dialog.open) return;
      const rect = dialog.getBoundingClientRect();
      const isInsideDialogBounds = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!isInsideDialogBounds) {
        closeSingleModeDialog();
      }
    }
    function handleSingleModeDialogClosed() {
      setSingleModeDialogScrollLock(false);
      isSingleModeDialogOpen.value = false;
      singleModeAlternateDialogChangeField.value = "";
      singleModeAlternateDialogSource.value = "";
      const previouslyFocused = singleModeDialogLastFocusedEl.value;
      nextTick(() => {
        if (previouslyFocused && previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected && typeof previouslyFocused.focus === "function") {
          previouslyFocused.focus({ preventScroll: true });
          singleModeDialogLastFocusedEl.value = null;
          return;
        }
        const fallback = collapseButtonRef.value;
        if (fallback && typeof fallback.focus === "function") {
          fallback.focus({ preventScroll: true });
        }
        singleModeDialogLastFocusedEl.value = null;
      });
    }
    async function maybeOpenSingleModeInvalidQueryDialogOnLoad() {
      logSingleModeDebug("load-check:start");
      if (mode.value !== "single") return;
      if (singleModePageLoadDialogHandled.value) return;
      if (singleModePageLoadDialogChecking.value) return;
      if (!isReadyToRender.value) return;
      if (singleModeHasInitialQueryString.value === null) {
        logSingleModeDebug("load-check:exit-query-unresolved");
        return;
      }
      if (!singleModeHasInitialQueryString.value) {
        singleModePageLoadDialogHandled.value = true;
        logSingleModeDebug("load-check:exit-no-query");
        return;
      }
      if (!hasAllSelection.value) {
        logSingleModeDebug("load-check:exit-form-incomplete");
        return;
      }
      if (!singleModePrimaryFieldsCompleteForCurrentPage.value) {
        logSingleModeDebug("load-check:exit-primary-incomplete");
        return;
      }
      singleModePageLoadDialogChecking.value = true;
      await nextTick();
      await nextTick();
      singleModePageLoadDialogChecking.value = false;
      singleModePageLoadDialogHandled.value = true;
      if (!singleModeQueryInvalidOnPageLoad.value) {
        logSingleModeDebug("load-check:exit-not-invalid");
        return;
      }
      if (singleModeAlternateRebate.value) {
        const mismatchField = singleModeCurrentPageMismatchField.value;
        if (mismatchField) {
          singleModeAlternateDialogSource.value = "load-mismatch";
          singleModeAlternateDialogChangeField.value = mismatchField;
        } else {
          singleModeAlternateDialogSource.value = "load";
          singleModeAlternateDialogChangeField.value = "";
        }
        logSingleModeDebug("load-check:open-alternate-modal");
        openSingleModeDialogVariant("alternate-rebate");
        return;
      }
      if (singleModeShouldSuppressInvalidQueryModal.value) {
        logSingleModeDebug("load-check:skip-invalid-modal-on-target-page");
        return;
      }
      logSingleModeDebug("load-check:open-invalid-modal");
      openSingleModeDialogVariant("invalid-query");
    }
    async function maybeOpenSingleModeAlternateRebateDialog(changeField = "") {
      logSingleModeDebug("first-change-check:start");
      if (mode.value !== "single") return;
      if (changeField) {
        singleModeQueuedChangeField.value = changeField;
      }
      if (singleModeFirstFilterChangeChecking.value) {
        singleModePendingFilterChangeCheck.value = true;
        return;
      }
      singleModeFirstFilterChangeChecking.value = true;
      do {
        singleModePendingFilterChangeCheck.value = false;
        const dialogChangeField = singleModeQueuedChangeField.value || changeField;
        singleModeQueuedChangeField.value = "";
        await nextTick();
        await nextTick();
        if (!hasAllSelection.value) {
          logSingleModeDebug("first-change-check:exit-form-incomplete");
          continue;
        }
        if (singleModeCurrentPageInVerifiedResults.value) {
          logSingleModeDebug("first-change-check:exit-current-page-valid");
          continue;
        }
        if (!singleModeAlternateRebate.value) {
          if (singleModeShouldSuppressInvalidQueryModal.value) {
            logSingleModeDebug(
              "first-change-check:skip-invalid-modal-on-target-page"
            );
            continue;
          }
          logSingleModeDebug(
            "first-change-check:open-invalid-modal-no-alternate"
          );
          singleModeAlternateDialogSource.value = "change";
          singleModeAlternateDialogChangeField.value = dialogChangeField;
          openSingleModeDialogVariant("invalid-query");
          continue;
        }
        logSingleModeDebug("first-change-check:open-alternate-modal");
        singleModeAlternateDialogSource.value = "change";
        singleModeAlternateDialogChangeField.value = dialogChangeField;
        openSingleModeDialogVariant("alternate-rebate");
      } while (singleModePendingFilterChangeCheck.value);
      singleModeFirstFilterChangeChecking.value = false;
    }
    const singleModeDialogFieldByStateKey = {
      type: "building",
      group: "building",
      tenure: "building",
      home_value: "homeValue",
      persons: "persons",
      income: "income",
      location: "location",
      heating: "heating",
      water_heating: "water",
      utility: "utility",
      gas: "gas"
    };
    function getSingleModeChangedField(currentState = {}, previousState = {}) {
      for (const key of Object.keys(singleModeDialogFieldByStateKey)) {
        if (currentState[key] !== previousState[key]) {
          return singleModeDialogFieldByStateKey[key];
        }
      }
      return "";
    }
    function openEdit(field, event) {
      editable.value = true;
      activeEdit.value = field;
      const trigger2 = event == null ? void 0 : event.currentTarget;
      if (trigger2 instanceof HTMLElement && typeof trigger2.blur === "function") {
        trigger2.blur();
      }
      focusSingleModeSelectForField(field);
    }
    function closeEdit(fieldKey = activeEdit.value) {
      const keyToFocus = fieldKey || activeEdit.value;
      activeEdit.value = "";
      if (!keyToFocus) return;
      nextTick(() => {
        const controlButton = buttonRefs.value[keyToFocus];
        if (controlButton && typeof controlButton.focus === "function") {
          controlButton.focus({ preventScroll: true });
        }
      });
    }
    function focusSingleModeSelectForField(fieldKey) {
      if (!fieldKey) return;
      let attempts = 0;
      const maxAttempts = 8;
      const tryFocus = () => {
        const targetSelect = selectRefs.value[fieldKey] || document.getElementById(`${fieldKey}Select`);
        if (targetSelect && typeof targetSelect.focus === "function" && !targetSelect.hasAttribute("disabled")) {
          targetSelect.focus({ preventScroll: true });
          return;
        }
        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(tryFocus, 30);
        }
      };
      nextTick(() => {
        nextTick(() => {
          tryFocus();
        });
      });
    }
    function handleSingleModeOutsidePointerDown(event) {
      if (mode.value !== "single" || !activeEdit.value) return;
      const activeFieldKey = activeEdit.value;
      const activeSelect = selectRefs.value[activeFieldKey] || document.getElementById(`${activeFieldKey}Select`);
      const activeEditableContainer = activeSelect == null ? void 0 : activeSelect.closest(".control.editable");
      if (!activeEditableContainer) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (activeEditableContainer.contains(target)) return;
      event.preventDefault();
      closeEdit(activeFieldKey);
    }
    function focusFirstSingleModeEditableControl() {
      const controlsRoot = document.getElementById("single-mode-controls");
      if (!controlsRoot) return;
      const firstVisibleSelect = controlsRoot.querySelector(
        ".control.editable .select:not([disabled])"
      );
      if (firstVisibleSelect && typeof firstVisibleSelect.focus === "function") {
        firstVisibleSelect.focus({ preventScroll: true });
        return;
      }
      const firstEditButton = controlsRoot.querySelector(
        ".control.button-group .rebate-setting:not([disabled])"
      );
      if (firstEditButton instanceof HTMLElement) {
        const fieldKey = firstEditButton.dataset.fieldKey || "";
        if (fieldKey) {
          openEdit(fieldKey);
          return;
        }
        if (typeof firstEditButton.focus === "function") {
          firstEditButton.focus({ preventScroll: true });
        }
        return;
      }
    }
    function enableAssistiveSimpleMode({ focusWithinTool = true } = {}) {
      assistiveSimpleMode.value = true;
      editModeView.value = false;
      editable.value = true;
      activeEdit.value = "";
      isCollapseView.value = false;
      singleModeSettingsContextMessage.value = "Screen reader enhanced interface enabled. Settings are now shown as select fields.";
      localStorage.setItem(ASSISTIVE_SIMPLE_MODE_KEY, "true");
      if (focusWithinTool) {
        nextTick(() => {
          focusFirstSingleModeEditableControl();
        });
      }
    }
    function handleAssistiveScreenReaderButton() {
      if (!assistiveSimpleMode.value) {
        enableAssistiveSimpleMode();
        return;
      }
      nextTick(() => {
        nextTick(() => {
          const resetButton = resetSimplifiedButtonRef.value;
          if (resetButton && typeof resetButton.focus === "function") {
            resetButton.focus({ preventScroll: true });
          }
        });
      });
    }
    function disableAssistiveSimpleMode() {
      assistiveSimpleMode.value = false;
      editModeView.value = false;
      editable.value = false;
      activeEdit.value = "";
      isCollapseView.value = true;
      singleModeSettingsContextMessage.value = "Screen reader enhanced interface disabled. Regular interface restored.";
      localStorage.removeItem(ASSISTIVE_SIMPLE_MODE_KEY);
    }
    function toggleEditModeView() {
      if (assistiveSimpleMode.value || isSingleModeEditToggleDisabled.value)
        return;
      editModeView.value = !editModeView.value;
      singleModeEditModePreference.value = editModeView.value;
      singleModeSettingsContextMessage.value = editModeView.value ? "Edit mode enabled. Use Tab to move between settings and Enter to edit." : "Edit mode disabled. Read-only details view enabled. Use Tab to reach the Edit button.";
      localStorage.setItem(
        "rebateEditModeView",
        JSON.stringify(singleModeEditModePreference.value)
      );
      if (editModeView.value) {
        nextTick(() => {
          focusFirstSingleModeEditableControl();
        });
      }
    }
    function toggleCollapseView() {
      isCollapseView.value = !isCollapseView.value;
      singleModeSettingsContextMessage.value = isCollapseView.value ? "Home details collapsed." : "Home details expanded.";
      if (!isCollapseView.value && mode.value === "single" && !assistiveSimpleMode.value) {
        editModeView.value = isSingleModeEditToggleLocked.value ? true : singleModeEditModePreference.value;
      }
      localStorage.setItem(
        "rebateCollapseView",
        JSON.stringify(isCollapseView.value)
      );
    }
    function handleFocus() {
      isLocationFocused.value = true;
      if (isMobile.value) {
        setTimeout(() => {
          const inputEl = document.querySelector("input.location-input");
          inputEl == null ? void 0 : inputEl.focus();
        }, 300);
      }
    }
    const handleLocationInputCommit = debounce(async (trigger2 = "change") => {
      var _a2, _b2, _c2, _d;
      await new Promise((resolve) => setTimeout(resolve, 150));
      let raw;
      if (isMobile.value && trigger2 === "blur") {
        const inputEl = document.querySelector("input.location-input");
        if (inputEl) {
          raw = inputEl.value;
          locationInputDisplay.value = raw;
        } else {
          raw = locationInputDisplay.value;
        }
      } else {
        raw = isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      }
      const trimmed = raw.trim().toLowerCase();
      let match = locationOptionsForInput.value.find(
        (opt) => opt.name.toLowerCase() === trimmed
      );
      if (!match && trigger2 === "blur" && raw !== "") {
        const possible = locationOptionsForInput.value.filter(
          (opt) => opt.name.toLowerCase().includes(trimmed)
        );
        if (possible.length > 0) {
          possible.sort((a, b) => {
            const aIndex = a.name.toLowerCase().indexOf(trimmed);
            const bIndex = b.name.toLowerCase().indexOf(trimmed);
            const aLengthDiff = Math.abs(a.name.length - raw.length);
            const bLengthDiff = Math.abs(b.name.length - raw.length);
            if (aIndex !== bIndex) return aIndex - bIndex;
            return aLengthDiff - bLengthDiff;
          });
          match = possible[0];
        }
      }
      if (match) {
        selectedLocationSlug.value = match.slug;
        locationInputValue.value = match.name;
        if (isMobile.value) {
          locationInputDisplay.value = match.name;
        }
        lastChangedField.value = "location";
        isExternalDirty.value = true;
        updateAddressBar();
        debouncedUpdateRebateDetails();
        ariaStatusMessage.value = `${match.name} selected. Moving to next field.`;
        writePreferredSettings({
          location: {
            slug: match.slug,
            name: match.name,
            region: ((_b2 = (_a2 = match.children) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.name) || "",
            region_slug: ((_d = (_c2 = match.children) == null ? void 0 : _c2[0]) == null ? void 0 : _d.slug) || ""
          }
        });
        await runArchiveFlowForField("location");
      } else {
        selectedLocationSlug.value = "";
      }
      isLocationFocused.value = false;
    }, 50);
    const isLocationFocused = /* @__PURE__ */ ref(false);
    const isLocationValid = computed(
      () => locationOptionsForInput.value.some(
        (opt) => opt.name.toLowerCase() === locationInputValue.value.trim().toLowerCase()
      )
    );
    async function handleSelectChange(fieldKey, newValue) {
      var _a2, _b2;
      if (newValue === void 0 || newValue === null) return;
      lastChangedField.value = fieldKey;
      isSavingEditMode.value = true;
      if (mode.value === "single" && activeEdit.value === fieldKey) {
        closeEdit(fieldKey);
        await nextTick();
      }
      isExternalDirty.value = true;
      if (mode.value !== "archive") {
        const fieldMeta = fields.value.find((f) => f.key === fieldKey) || null;
        const fieldName = (fieldMeta == null ? void 0 : fieldMeta.shortDesc) || (fieldMeta == null ? void 0 : fieldMeta.label) || fieldKey;
        let selectedText = "";
        if ((fieldMeta == null ? void 0 : fieldMeta.isGrouped) && Array.isArray(fieldMeta.groups)) {
          selectedText = ((_a2 = fieldMeta.groups.flatMap(
            (group) => Array.isArray(group == null ? void 0 : group.children) ? group.children : []
          ).find((option) => (option == null ? void 0 : option.slug) === newValue)) == null ? void 0 : _a2.name) || "";
        } else if (Array.isArray(fieldMeta == null ? void 0 : fieldMeta.options)) {
          selectedText = ((_b2 = fieldMeta.options.find((option) => (option == null ? void 0 : option.slug) === newValue)) == null ? void 0 : _b2.name) || "";
        }
        if (!selectedText) {
          selectedText = (fieldMeta == null ? void 0 : fieldMeta.displayValue) || String(newValue);
        }
        singleModeSettingsContextMessage.value = `${fieldName} updated to ${selectedText}.`;
        isSavingEditMode.value = false;
        return;
      }
      await runArchiveFlowForField(fieldKey);
      isSavingEditMode.value = false;
    }
    async function runArchiveFlowForField(fieldKey) {
      if (mode.value !== "archive") return;
      await nextTick();
      await nextTick();
      const allFields = fields.value;
      const isAnsweredAndValid = (field) => {
        var _a2, _b2;
        const value = ((_a2 = field.model) == null ? void 0 : _a2.value) ?? null;
        const hasError = ((_b2 = field.isInvalid) == null ? void 0 : _b2.call(field)) || false;
        return !!value && !hasError;
      };
      const anyError = hasAnyError.value;
      const currentIndex = allFields.findIndex((f) => f.key === fieldKey);
      const firstInvalid = allFields.find((field) => {
        var _a2;
        return (_a2 = field.isInvalid) == null ? void 0 : _a2.call(field);
      });
      const unansweredAbove = currentIndex > 0 ? allFields.slice(0, currentIndex).find((field) => !isAnsweredAndValid(field)) : null;
      const unansweredBelow = currentIndex !== -1 && currentIndex < allFields.length - 1 ? allFields.slice(currentIndex + 1).find((field) => !isAnsweredAndValid(field)) : null;
      const allValid = allFields.every((field) => isAnsweredAndValid(field));
      if (anyError && firstInvalid) {
        await scrollToQuestion(firstInvalid, {
          keepPreviousVisible: false
        });
        await nextTick();
        const errorEl = document.querySelector(".message.error-message");
        if (errorEl) {
          errorEl.setAttribute("tabindex", "-1");
          errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
          errorEl.focus({ preventScroll: true });
        }
        return;
      }
      if (unansweredAbove) {
        await scrollToQuestion(unansweredAbove, {
          keepPreviousVisible: false
        });
        return;
      }
      if (unansweredBelow) {
        await scrollToQuestion(unansweredBelow, {
          keepPreviousVisible: true
        });
        return;
      }
      if (allValid && !hasArchiveAutoScrolledToResults.value) {
        scrollToArchiveResultsOnce();
      }
    }
    function scrollToArchiveResultsOnce() {
      if (hasArchiveAutoScrolledToResults.value) return;
      const resultsSection = document.getElementById("rebatesResults");
      if (!resultsSection) return;
      hasArchiveAutoScrolledToResults.value = true;
      setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        resultsSection.setAttribute("tabindex", "-1");
        resultsSection.focus({ preventScroll: true });
      }, 100);
    }
    async function scrollToQuestion(targetField, { keepPreviousVisible = false } = {}) {
      var _a2, _b2;
      await nextTick();
      await new Promise((r) => requestAnimationFrame(r));
      const allFields = fields.value;
      const idx = allFields.findIndex((f) => f.key === targetField.key);
      const controlEl = document.getElementById(`${targetField.key}Select`) || document.getElementById(`${targetField.key}Input`);
      const container = controlEl == null ? void 0 : controlEl.closest(".question-container");
      if (!container) {
        console.warn(
          `Could not find question container for field: ${targetField.key}`
        );
        return;
      }
      const targetRect = container.getBoundingClientRect();
      let offsetTop;
      if (keepPreviousVisible && idx > 0) {
        const prevField = allFields[idx - 1];
        const prevEl = ((_a2 = document.getElementById(`${prevField.key}Select`)) == null ? void 0 : _a2.closest(".question-container")) || ((_b2 = document.getElementById(`${prevField.key}Input`)) == null ? void 0 : _b2.closest(".question-container"));
        let visibleOffset = 150;
        if (prevEl) {
          visibleOffset = prevEl.offsetHeight + 150;
        }
        offsetTop = window.scrollY + targetRect.top - visibleOffset;
      } else {
        offsetTop = window.scrollY + targetRect.top - 150;
      }
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: "smooth"
      });
      if (controlEl && typeof controlEl.focus === "function") {
        setTimeout(() => {
          controlEl.focus({ preventScroll: true });
        }, 200);
      }
    }
    function handleSelectKeydown(event, fieldKey, currentValue) {
      if (event.key === "Enter") {
        event.preventDefault();
        if (mode.value === "archive") {
          runArchiveFlowForField(fieldKey);
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        activeEdit.value = "";
        return;
      }
      if (event.key === "Tab") {
        if (mode.value !== "archive") return;
        if (event.shiftKey) return;
        if (hasAllSelection.value) return;
        nextTick(() => scrollToNextVisibleField(fieldKey, "down"));
      }
    }
    async function scrollToNextVisibleField(currentKey, direction = "down") {
      await nextTick();
      const all = fields.value;
      const idx = all.findIndex((f) => f.key === currentKey);
      if (idx === -1) return;
      const nextField = direction === "up" ? all.slice(0, idx).reverse().find((f) => f) : all.slice(idx + 1).find((f) => f);
      if (!nextField) return;
      const nextEl = document.getElementById(`${nextField.key}Select`) || document.getElementById(`${nextField.key}Input`);
      if (nextEl) {
        const rect = nextEl.getBoundingClientRect();
        const offsetTop = window.scrollY + rect.top - 150;
        window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
      }
    }
    watch(activeEdit, async (newKey) => {
      if (!newKey) return;
      if (mode.value !== "single") return;
      if (!isSingleModeEditModeActive.value) return;
      focusSingleModeSelectForField(newKey);
    });
    function clearSettings(event) {
      var _a2;
      (_a2 = event == null ? void 0 : event.preventDefault) == null ? void 0 : _a2.call(event);
      selectedBuildingTypeSlug.value = "";
      murbTenure.value = "";
      selectedHomeValueSlug.value = "";
      selectedPersonsSlug.value = "";
      selectedIncomeRangeSlug.value = "";
      selectedLocationSlug.value = "";
      selectedHeatingSlug.value = "";
      selectedWaterHeatingSlug.value = "";
      selectedUtilitySlug.value = "";
      selectedGasSlug.value = "";
      hasArchiveAutoScrolledToResults.value = false;
      const url = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", url);
      syncCurrentQueryStringFromWindow();
      localStorage.removeItem("rebateToolSettings");
      editable.value = true;
      const firstMissing = fields.value.find((f) => !f.displayValue);
      activeEdit.value = firstMissing ? firstMissing.key : "";
      localStorage.removeItem("rebateEditableState");
    }
    const sortOtherLast = (items = []) => {
      if (!Array.isArray(items)) return items;
      const rest = items.filter((i) => (i == null ? void 0 : i.slug) !== "other");
      const others = items.filter((i) => (i == null ? void 0 : i.slug) === "other");
      return [...rest, ...others];
    };
    const sortBySlugWithOtherLast = (items = []) => {
      if (!Array.isArray(items)) return items;
      return [...items].sort((a, b) => {
        const aSlug = String((a == null ? void 0 : a.slug) || "");
        const bSlug = String((b == null ? void 0 : b.slug) || "");
        const aIsOther = aSlug === "other";
        const bIsOther = bSlug === "other";
        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;
        return aSlug.localeCompare(bSlug);
      });
    };
    const fields = computed(() => [
      {
        key: "location",
        shortDesc: "Home location",
        label: "What community do you live in or closest to?",
        model: selectedLocationSlug,
        options: locationOptionsForInput.value,
        displayValue: selectedLocationName.value ? selectedLocationName.value : "",
        missingMessage: "Missing location details",
        isInvalid: () => !selectedLocationSlug.value,
        filter_desc: "Start typing to search communities.",
        error_desc: "Please choose a community from the list."
      },
      {
        key: "murbTenure",
        shortDesc: "Rent or own",
        label: "Do you rent or own your home?",
        model: murbTenure,
        options: [
          { slug: "own", name: "Own" },
          { slug: "rent", name: "Rent" }
        ],
        displayValue: murbTenureLabel.value,
        missingMessage: "Missing ownership status"
        // description:
        // 'Only rentals in multi-unit residential buildings are currently eligible.',
        // error_desc:
        // 'Rentals of your home type are not eligible. Only rentals in multi-unit residential buildings are currently eligible.',
        // isInvalid: () =>
        // selectedBuildingGroupSlug.value === 'ground-oriented-dwellings' &&
        // murbTenure.value === 'rent'
      },
      {
        key: "building",
        shortDesc: "Type of home",
        label: "What type of home do you live in?",
        model: selectedBuildingTypeSlug,
        groups: buildingTypeGroups.value,
        isGrouped: true,
        displayValue: selectedBuildingTypeName.value,
        missingMessage: "Missing home type",
        description: "Your home must have its own electricity meter. The utility account must be in the name of a resident of the household.",
        // filter_desc:
        //   'Changing between Ground Oriented / MURB types will require you to update the assessed property value information.',
        error_desc: '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your home type.',
        definition: "See the different home types",
        glossary_link: "/definitions/home-types/",
        glossary_wide: true,
        isInvalid: () => selectedBuildingTypeSlug.value === "other"
      },
      {
        key: "homeValue",
        shortDesc: "Assessed property value",
        label: "What is the current assessed value of your property?",
        model: selectedHomeValueSlug,
        options: homeValueOptions.value,
        displayValue: selectedHomeValueName.value,
        missingMessage: "Missing home value",
        disabled: !selectedBuildingGroupSlug.value || selectedBuildingTypeSlug.value === "other",
        ready: homeValueOptions.value.length > 0,
        // filter_desc:
        //   'The amount options shown change based on the set type of home.',
        disabled_desc: 'Please answer the "type of home you live in" first.',
        definition: "How to find the assessed value of your property",
        glossary_link: "/definitions/assessed-home-value/",
        isInvalid: () => !selectedHomeValueSlug.value && !!selectedBuildingGroupSlug.value || selectedBuildingTypeSlug.value === "other"
      },
      {
        key: "persons",
        shortDesc: "People in household",
        label: "How many people live in your home (including adults and children)?",
        model: selectedPersonsSlug,
        options: personCountOptions.value,
        displayValue: selectedPersonsCount.value,
        missingMessage: "Missing household number",
        // description:
        //   'Changing this field will require you to update the pre-tax income range information as well.',
        isInvalid: () => !selectedPersonsSlug.value
      },
      {
        key: "income",
        shortDesc: "Household income",
        label: "What is the combined pre-tax income of all adults in your household (excluding dependants)?",
        model: selectedIncomeRangeSlug,
        options: incomeRangeOptions.value,
        displayValue: selectedIncomeRangeName.value,
        missingMessage: "Missing household income",
        disabled: !selectedPersonsSlug.value,
        ready: incomeRangeOptions.value.length > 0,
        // description:
        //   'The amount options shown change based on the set number of people in the household.',
        disabled_desc: 'Please answer "how many people live in your home" to enable this selection.',
        definition: "Why we ask for household income",
        glossary_link: "/definitions/household-income/",
        isInvalid: () => !!selectedPersonsSlug.value && !selectedIncomeRangeSlug.value
      },
      {
        key: "heating",
        shortDesc: "Room heating type",
        label: "How do you heat the rooms in your home?",
        description: "If you have multiple heat sources, choose the option that applies to most of your home. If your home is heated with both a wood stove and another source, choose the other source as your primary heating type.",
        model: selectedHeatingSlug,
        options: heatingOptions.value,
        displayValue: selectedHeatingName.value,
        missingMessage: "Missing room heating details",
        error_desc: '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your room heating type.',
        isInvalid: () => !selectedHeatingSlug.value || selectedHeatingSlug.value === "other"
      },
      {
        key: "water",
        shortDesc: "Water heating type",
        label: "How do you heat your water?",
        description: "If you have more than one system, choose the one that heats most of your water.",
        model: selectedWaterHeatingSlug,
        options: waterHeatingOptions.value,
        displayValue: selectedWaterHeatingName.value,
        missingMessage: "Missing water heating details",
        error_desc: '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your water heating type. ',
        isInvalid: () => !selectedWaterHeatingSlug.value || selectedWaterHeatingSlug.value === "other"
      },
      {
        key: "gas",
        shortDesc: "Natural gas or propane",
        label: "Who is your gas or propane provider?",
        model: selectedGasSlug,
        options: gasOptions.value,
        displayValue: selectedGasName.value,
        missingMessage: "Missing service details",
        isInvalid: () => !selectedGasSlug.value
      },
      {
        key: "utility",
        shortDesc: "Electric utility company",
        label: "Who is your electricity provider?",
        model: selectedUtilitySlug,
        options: utilityOptions.value,
        displayValue: selectedUtilityName.value,
        missingMessage: "Missing service details",
        error_desc: 'Without your electricity provider, we can’t determine your rebate eligibility. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help or choose one of the listed options. ',
        isInvalid: () => !selectedUtilitySlug.value || selectedUtilitySlug.value === "other"
      }
    ]);
    const isExternalDirty = /* @__PURE__ */ ref(false);
    const bootstrapped = /* @__PURE__ */ ref(false);
    onMounted(() => {
      watch(
        urlStateDeps,
        (newDeps) => {
          if (!bootstrapped.value) return;
          const compact = Object.fromEntries(
            Object.entries(newDeps).filter(([, v]) => v !== "" && v != null)
          );
          localStorage.setItem("rebateToolSettings", JSON.stringify(compact));
        },
        { deep: true }
        // no immediate:true — avoids clobbering saved settings.
      );
    });
    watch(isExternalDirty, (newVal) => {
      const blocks = document.querySelectorAll(
        ".multi-query-content-block, .query-conditional-group-block"
      );
      blocks.forEach((el) => el.classList.toggle("is-dirty-variable", newVal));
    });
    function applyDirtyClasses(val) {
      document.querySelectorAll(
        '.multi-query-content-block > span[data-replace="value"]'
      ).forEach((el) => el.classList.toggle("is-dirty", val));
    }
    function normalizeSingleModeTitleText(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }
    function ensureSingleModeHeatingTitleVisible(titleEl, { titleSelector = ".subtitle" } = {}) {
      if (typeof document === "undefined") return;
      const resolvedTitleEl = titleEl || document.querySelector(titleSelector);
      if (!resolvedTitleEl) {
        document.documentElement.classList.remove(
          SINGLE_MODE_TITLE_PENDING_CLASS
        );
        return;
      }
      resolvedTitleEl.dataset.singleModeTitleManaged = "true";
      resolvedTitleEl.dataset.singleModeTitleState = "visible";
      resolvedTitleEl.removeAttribute("aria-hidden");
      resolvedTitleEl.style.maxHeight = `${Math.max(resolvedTitleEl.scrollHeight, 1)}px`;
      document.documentElement.classList.remove(SINGLE_MODE_TITLE_PENDING_CLASS);
    }
    function setSingleModeHeatingTitleVisibility(isVisible, { titleSelector = ".subtitle" } = {}) {
      if (typeof document === "undefined" || typeof window === "undefined")
        return;
      const titleEl = document.querySelector(titleSelector);
      if (!titleEl) {
        document.documentElement.classList.toggle(
          SINGLE_MODE_TITLE_PENDING_CLASS,
          mode.value === "single" && !isVisible
        );
        return;
      }
      if (singleModeTitleRevealFrame) {
        window.cancelAnimationFrame(singleModeTitleRevealFrame);
        singleModeTitleRevealFrame = 0;
      }
      titleEl.dataset.singleModeTitleManaged = "true";
      titleEl.dataset.singleModeTitleState = "hidden";
      titleEl.setAttribute("aria-hidden", "true");
      titleEl.style.maxHeight = "0px";
      if (!isVisible) {
        document.documentElement.classList.toggle(
          SINGLE_MODE_TITLE_PENDING_CLASS,
          mode.value === "single"
        );
        return;
      }
      const targetHeight = Math.max(titleEl.scrollHeight, 1);
      void titleEl.offsetHeight;
      singleModeTitleRevealFrame = window.requestAnimationFrame(() => {
        document.documentElement.classList.remove(
          SINGLE_MODE_TITLE_PENDING_CLASS
        );
        singleModeTitleRevealFrame = window.requestAnimationFrame(() => {
          titleEl.dataset.singleModeTitleState = "visible";
          titleEl.style.maxHeight = `${targetHeight}px`;
          titleEl.removeAttribute("aria-hidden");
          singleModeTitleRevealFrame = 0;
        });
      });
    }
    function getSingleModeHeatingTitleTarget(titleEl) {
      const currentText = normalizeSingleModeTitleText(titleEl == null ? void 0 : titleEl.textContent);
      if (!singleModeTitleOriginalText.value && currentText) {
        singleModeTitleOriginalText.value = currentText;
      }
      const originalTitle = singleModeTitleOriginalText.value || currentText;
      if (!originalTitle) return null;
      if (singleModeResolvedTitleHtml.value) {
        singleModeLastValidTitleHtml.value = singleModeResolvedTitleHtml.value;
        return {
          content: singleModeResolvedTitleHtml.value,
          signature: `html:${singleModeResolvedTitleHtml.value}`,
          asHtml: true
        };
      }
      if (singleModeCanRetainLastValidTitle.value && singleModeLastValidTitleHtml.value) {
        return {
          content: singleModeLastValidTitleHtml.value,
          signature: `html:${singleModeLastValidTitleHtml.value}`,
          asHtml: true
        };
      }
      singleModeLastValidTitleHtml.value = "";
      return {
        content: originalTitle,
        signature: `text:${originalTitle}`,
        asHtml: false
      };
    }
    function updateSingleModeHeatingTitleContent(titleEl, { content, signature, asHtml = true, titleSelector = ".subtitle" } = {}) {
      if (!titleEl) return;
      const applyContent = () => {
        if (asHtml) {
          titleEl.innerHTML = content;
        } else {
          titleEl.textContent = content;
        }
        titleEl.dataset.singleModeTitleSignature = signature;
      };
      if (singleModeTitleSwapTimeout) {
        window.clearTimeout(singleModeTitleSwapTimeout);
        singleModeTitleSwapTimeout = 0;
      }
      const currentSignature = titleEl.dataset.singleModeTitleSignature || "";
      const isCurrentlyVisible = titleEl.dataset.singleModeTitleState === "visible";
      if (currentSignature === signature) {
        ensureSingleModeHeatingTitleVisible(titleEl, { titleSelector });
        return;
      }
      if (isCurrentlyVisible && currentSignature) {
        setSingleModeHeatingTitleVisibility(false, { titleSelector });
        singleModeTitleSwapTimeout = window.setTimeout(() => {
          applyContent();
          setSingleModeHeatingTitleVisibility(true, { titleSelector });
          singleModeTitleSwapTimeout = 0;
        }, SINGLE_MODE_TITLE_TRANSITION_MS);
        return;
      }
      applyContent();
      setSingleModeHeatingTitleVisibility(true, { titleSelector });
    }
    const singleModeTitleOriginalText = /* @__PURE__ */ ref("");
    const singleModeLastValidTitleHtml = /* @__PURE__ */ ref("");
    function applySingleModeHeatingTitle({ titleSelector = ".subtitle" } = {}) {
      if (typeof document === "undefined" || typeof window === "undefined")
        return;
      const titleEl = document.querySelector(titleSelector);
      if (!titleEl) return;
      const nextTarget = getSingleModeHeatingTitleTarget(titleEl);
      if (!nextTarget) return;
      updateSingleModeHeatingTitleContent(titleEl, {
        content: nextTarget.content,
        signature: nextTarget.signature,
        asHtml: nextTarget.asHtml,
        titleSelector
      });
    }
    onMounted(() => {
      var _a2;
      const el = document.getElementById("vnextRebateFilterApp");
      if ((_a2 = el == null ? void 0 : el.dataset) == null ? void 0 : _a2.mode) {
        mode.value = el.dataset.mode;
      }
    });
    onMounted(async () => {
      let shouldRedirect = false;
      try {
        const res = await fetch(rebatesAPI, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        api.value = await res.json();
        const params = new URLSearchParams(window.location.search);
        singleModeHasInitialQueryString.value = params.toString().length > 0;
        const hasTool = params.get("tool") === "rebates";
        const saved = localStorage.getItem("rebateToolSettings");
        if (hasTool) {
          initFromQueryString();
        } else if (saved) {
          initFromLocalStorage(JSON.parse(saved));
          if (mode.value === "archive") {
            updateAddressBar();
          } else {
            shouldRedirect = true;
            window.location.href = assembledUrl.value;
            return;
          }
        } else {
          console.log("No saved settings — starting fresh");
        }
        if (mode.value === "single") {
          await updateRebateDetails();
        }
        if (mode.value === "single" && !hasAllSelection.value && !singleModeOpenFromPlannerSource.value) {
          isCollapseView.value = true;
        }
        isReadyToRender.value = true;
        maybeOpenSingleModeInvalidQueryDialogOnLoad();
        bootstrapped.value = true;
        hydratePreferredSettingsFromRebateToolSettings();
        if (mode.value === "single") {
          updateAddressBar();
        }
        watch(
          urlStateDeps,
          () => {
            isExternalDirty.value = true;
            if (mode.value === "single") {
              isSingleModeTitleAwaitingAjax.value = true;
            }
            updateAddressBar();
            debouncedUpdateRebateDetails();
          },
          { deep: true }
        );
        watch(homeValueOptions, async (newVal, oldVal = []) => {
          const previousSlug = selectedHomeValueSlug.value;
          const hasCurrentSelection = Boolean(previousSlug);
          const currentSelectionStillValid = hasCurrentSelection && newVal.some((o) => o.slug === previousSlug);
          if (currentSelectionStillValid) return;
          if (mode.value === "single") {
            if (newVal.length === 0) {
              selectedHomeValueSlug.value = "";
              return;
            }
            const oldOptions = Array.isArray(oldVal) ? oldVal : [];
            const previousOption = oldOptions.find((o) => o.slug === previousSlug) || null;
            const previousText = String(
              (previousOption == null ? void 0 : previousOption.slug) || (previousOption == null ? void 0 : previousOption.name) || previousSlug || ""
            ).toLowerCase();
            let mapped = null;
            if (previousText.includes("under") || previousText.includes("less")) {
              mapped = newVal.find((o) => {
                const t = String(
                  (o == null ? void 0 : o.slug) || (o == null ? void 0 : o.name) || ""
                ).toLowerCase();
                return t.includes("under") || t.includes("less");
              }) || null;
            } else if (previousText.includes("over") || previousText.includes("more")) {
              mapped = newVal.find((o) => {
                const t = String(
                  (o == null ? void 0 : o.slug) || (o == null ? void 0 : o.name) || ""
                ).toLowerCase();
                return t.includes("over") || t.includes("more");
              }) || null;
            }
            selectedHomeValueSlug.value = (mapped == null ? void 0 : mapped.slug) || "";
            return;
          }
          if (!selectedHomeValueSlug.value && newVal.length > 0) {
            fieldRenderKeys.value.homeValue++;
            await nextTick();
            activeEdit.value = "homeValue";
          } else if (selectedHomeValueSlug.value && !newVal.find((o) => o.slug === selectedHomeValueSlug.value)) {
            selectedHomeValueSlug.value = "";
            fieldRenderKeys.value.homeValue++;
            await nextTick();
            activeEdit.value = "homeValue";
          }
        });
        watch(incomeRangeOptions, async (newVal) => {
          if (!selectedIncomeRangeSlug.value && newVal.length > 0) {
            fieldRenderKeys.value.income++;
            await nextTick();
            activeEdit.value = "income";
          } else if (selectedIncomeRangeSlug.value && !newVal.find((o) => o.slug === selectedIncomeRangeSlug.value)) {
            selectedIncomeRangeSlug.value = "";
            fieldRenderKeys.value.income++;
            await nextTick();
            activeEdit.value = "income";
          }
        });
      } catch (e) {
        loadError.value = String(e);
        console.error("Failed to fetch rebates:", e);
      } finally {
        isLoading.value = false;
        if (!shouldRedirect) {
          isReadyToRender.value = true;
        }
      }
      nextTick(() => runOptionalGlobal("cleanbcdxBhDefinitions"));
      nextTick(() => runOptionalGlobal("cleanbcdxBhRebatesArchiveLoader"));
    });
    function initFromLocalStorage(data) {
      if (!data || typeof data !== "object") return;
      const restoredBuildingTypeSlug = getRestoredBuildingTypeSlug({
        type: data.type,
        group: data.group,
        mode: mode.value,
        buildingTypeGroups: buildingTypeGroups.value
      });
      if (restoredBuildingTypeSlug) {
        selectedBuildingTypeSlug.value = restoredBuildingTypeSlug;
      }
      if (data.tenure && (data.tenure === "own" || data.tenure === "rent"))
        murbTenure.value = data.tenure;
      if (data.home_value && homeValueOptions.value.find((h2) => h2.slug === data.home_value)) {
        selectedHomeValueSlug.value = data.home_value;
      }
      if (data.persons && personCountOptions.value.some((p2) => p2.slug === data.persons)) {
        selectedPersonsSlug.value = data.persons;
      }
      if (data.income && incomeRangeOptions.value.some((r) => r.slug === data.income)) {
        selectedIncomeRangeSlug.value = data.income;
      }
      if (data.location) {
        const loc = locationOptionsForInput.value.find(
          (l) => l.slug === data.location
        ) || locationOptionsForInput.value.find((l) => l.name === data.location);
        if (loc) selectedLocationSlug.value = loc.slug;
      }
      if (data.heating) {
        const heating = findHeatingOptionByValue(
          heatingOptions.value,
          data.heating
        );
        if (heating) selectedHeatingSlug.value = heating.slug;
      }
      if (data.water_heating) {
        const waterHeating = findHeatingOptionByValue(
          waterHeatingOptions.value,
          data.water_heating
        );
        if (waterHeating) selectedWaterHeatingSlug.value = waterHeating.slug;
      }
      if (data.utility) {
        const utility = utilityOptions.value.find((u) => u.slug === data.utility) || utilityOptions.value.find((u) => u.name === data.utility);
        if (utility) selectedUtilitySlug.value = utility.slug;
      }
      if (data.gas) {
        const gas = gasOptions.value.find((g) => g.slug === data.gas) || gasOptions.value.find((g) => g.name === data.gas);
        if (gas) selectedGasSlug.value = gas.slug;
      }
      updateAddressBar();
    }
    const buildingTypeGroups = computed(() => {
      var _a2, _b2;
      const raw = ((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["building-types"]) ?? [];
      const withChildrenSorted = raw.map((group) => ({
        ...group,
        children: sortBySlugWithOtherLast(group.children ?? [])
      }));
      const sorted = sortBySlugWithOtherLast(withChildrenSorted);
      if (mode.value === "single") {
        return sorted.filter((g) => (g == null ? void 0 : g.slug) !== "other");
      }
      return sorted;
    });
    const selectedBuildingTypeSlug = /* @__PURE__ */ ref("");
    watch(
      [() => mode.value, buildingTypeGroups],
      () => {
        const normalizedSelection = getRestoredBuildingTypeSlug({
          type: selectedBuildingTypeSlug.value,
          mode: mode.value,
          buildingTypeGroups: buildingTypeGroups.value
        });
        if (normalizedSelection !== selectedBuildingTypeSlug.value) {
          selectedBuildingTypeSlug.value = normalizedSelection;
        }
      },
      { immediate: true }
    );
    const childToGroupSlug = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const g of buildingTypeGroups.value) {
        for (const c of g.children ?? []) map.set(c.slug, g.slug);
      }
      return map;
    });
    const selectedBuildingGroupSlug = computed(() => {
      if (!selectedBuildingTypeSlug.value) return "";
      if (buildingTypeGroups.value.some(
        (g) => g.slug === selectedBuildingTypeSlug.value
      ))
        return selectedBuildingTypeSlug.value;
      return childToGroupSlug.value.get(selectedBuildingTypeSlug.value) || "";
    });
    const selectedBuildingTypeName = computed(() => {
      const sel = selectedBuildingTypeSlug.value;
      if (!sel) return "";
      const group = buildingTypeGroups.value.find((g) => g.slug === sel);
      if (group) return group.name;
      for (const g of buildingTypeGroups.value) {
        const child = (g.children ?? []).find((c) => c.slug === sel);
        if (child) return child.name;
      }
      return "";
    });
    const murbTenure = /* @__PURE__ */ ref("");
    const murbTenureLabel = computed(
      () => murbTenure.value === "own" ? "Own" : murbTenure.value === "rent" ? "Rent" : ""
    );
    const homeValueOptions = computed(() => {
      var _a2, _b2, _c2, _d;
      const hvGroups = ((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["home-value"]) ?? [];
      const groupSlug = selectedBuildingGroupSlug.value;
      if (!groupSlug) return [];
      const groupObj = (((_d = (_c2 = api.value) == null ? void 0 : _c2["settings-selects"]) == null ? void 0 : _d["building-types"]) ?? []).find((g) => g.slug === groupSlug);
      const groupName = (groupObj == null ? void 0 : groupObj.name) || "";
      const singularish = groupSlug.replace(/s$/, "");
      const hvGroup = hvGroups.find((g) => g.slug === `${groupSlug}-value`) || hvGroups.find((g) => g.name === groupName) || hvGroups.find((g) => g.slug === `${singularish}-value`) || hvGroups.find((g) => g.slug.startsWith(singularish)) || null;
      return (hvGroup == null ? void 0 : hvGroup.children) ?? [];
    });
    const selectedHomeValueSlug = /* @__PURE__ */ ref("");
    const selectedHomeValueName = computed(() => {
      const match = homeValueOptions.value.find(
        (v) => v.slug === selectedHomeValueSlug.value
      );
      return match ? match.name : "";
    });
    const personCountOptions = computed(
      () => {
        var _a2, _b2;
        return (((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["income-bands"]) ?? []).map((p2) => ({
          name: p2.name,
          slug: p2.slug,
          id: p2.id
        }));
      }
    );
    const selectedPersonsSlug = /* @__PURE__ */ ref("");
    const selectedPersonsGroup = computed(
      () => {
        var _a2, _b2;
        return (((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["income-bands"]) ?? []).find(
          (p2) => p2.slug === selectedPersonsSlug.value
        ) || null;
      }
    );
    const selectedPersonsCount = computed(
      () => {
        var _a2;
        return ((_a2 = selectedPersonsGroup.value) == null ? void 0 : _a2.name) || "";
      }
    );
    const incomeRangeOptions = computed(() => {
      var _a2;
      const children = ((_a2 = selectedPersonsGroup.value) == null ? void 0 : _a2.children) ?? [];
      return children.map((r) => ({
        ...r,
        name: r.name.replace(/^Range:\s*/, "")
      })).sort((a, b) => {
        const order = { t1: 1, t2: 2, t3: 3, t0: 4 };
        const aCode = a.slug.split("-").pop();
        const bCode = b.slug.split("-").pop();
        return (order[aCode] || 99) - (order[bCode] || 99);
      });
    });
    const selectedIncomeRangeSlug = /* @__PURE__ */ ref("");
    const selectedIncomeRangeName = computed(() => {
      const match = incomeRangeOptions.value.find(
        (r) => r.slug === selectedIncomeRangeSlug.value
      );
      return match ? match.name : "";
    });
    const locationOptions = computed(
      () => {
        var _a2, _b2;
        return ((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["locations"]) ?? [];
      }
    );
    const isAllLocationsOption = (opt) => {
      var _a2, _b2, _c2, _d;
      const name = (_b2 = (_a2 = opt == null ? void 0 : opt.name) == null ? void 0 : _a2.toLowerCase) == null ? void 0 : _b2.call(_a2).trim();
      const slug = (_d = (_c2 = opt == null ? void 0 : opt.slug) == null ? void 0 : _c2.toLowerCase) == null ? void 0 : _d.call(_c2).trim();
      return name === "all locations" || slug === "all" || slug === "all-locations";
    };
    const locationOptionsForInput = computed(
      () => locationOptions.value.filter((opt) => !isAllLocationsOption(opt))
    );
    const selectedLocationSlug = /* @__PURE__ */ ref("");
    const selectedLocation = computed(
      () => locationOptionsForInput.value.find(
        (l) => l.slug === selectedLocationSlug.value
      ) || null
    );
    const locationInputValue = /* @__PURE__ */ ref("");
    const isMobile = /* @__PURE__ */ ref(false);
    onMounted(() => {
      isMobile.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    });
    const locationInputDisplay = /* @__PURE__ */ ref("");
    watch(locationInputValue, (newVal) => {
      if (isMobile.value) {
        locationInputDisplay.value = newVal;
      }
    });
    const normalizeLocationQuery = (val) => (val || "").toLowerCase().trim().replace(/\s+/g, "-");
    const normalizedLocationOptions = computed(
      () => locationOptionsForInput.value.filter((opt) => opt == null ? void 0 : opt.name).map((opt) => ({
        ...opt,
        norm: normalizeLocationQuery(opt.name)
      }))
    );
    const setLocationDisplayDebounced = debounce((v) => {
      locationInputDisplay.value = v;
    }, 300);
    const locationInputProxy = computed({
      get() {
        return isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      },
      set(val) {
        if (isMobile.value) {
          setLocationDisplayDebounced(val);
        } else {
          locationInputValue.value = val;
        }
      }
    });
    const locationQuery = computed(() => {
      const raw = isMobile.value ? locationInputDisplay.value : locationInputValue.value;
      return normalizeLocationQuery(raw);
    });
    const locationQueryIsEmpty = computed(() => !locationQuery.value);
    const hasValidArchiveLocationSelection = computed(
      () => mode.value === "archive" && isLocationValid.value && Boolean(selectedLocationSlug.value)
    );
    function clearArchiveLocationSelection() {
      selectedLocationSlug.value = "";
      locationInputValue.value = "";
      locationInputDisplay.value = "";
      isLocationFocused.value = true;
      nextTick(() => {
        var _a2;
        (_a2 = document.getElementById("locationSelect")) == null ? void 0 : _a2.focus();
      });
    }
    const mobileLocationOptions = computed(() => {
      const q = locationQuery.value;
      if (!q) return [];
      const list = normalizedLocationOptions.value;
      const starts = [];
      const includes = [];
      for (const opt of list) {
        if (!(opt == null ? void 0 : opt.norm)) continue;
        if (opt.norm.startsWith(q)) {
          starts.push(opt);
          if (starts.length >= 10) return starts;
        } else if (opt.norm.includes(q)) {
          includes.push(opt);
        }
      }
      for (const opt of includes) {
        starts.push(opt);
        if (starts.length >= 10) break;
      }
      return starts;
    });
    const selectedRegion = computed(
      () => {
        var _a2, _b2, _c2;
        return ((_c2 = (_b2 = (_a2 = selectedLocation.value) == null ? void 0 : _a2.children) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.slug) || "";
      }
    );
    const selectedLocationName = computed(() => {
      var _a2;
      return ((_a2 = selectedLocation.value) == null ? void 0 : _a2.name) || "";
    });
    const selectedRegionName = computed(
      () => {
        var _a2, _b2, _c2;
        return ((_c2 = (_b2 = (_a2 = selectedLocation.value) == null ? void 0 : _a2.children) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.name) || "";
      }
    );
    const heatingOptions = computed(() => {
      var _a2, _b2;
      const opts = sortOtherLast(
        ((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["heating-types"]) ?? []
      ).map((o) => {
        if (String((o == null ? void 0 : o.slug) ?? "").toLowerCase() !== "electricity") {
          return o;
        }
        return {
          ...o,
          // name: `${o.name} (e.g. baseboard or furnace)`
          name: `Electric (e.g. baseboard or furnace)`
        };
      });
      return opts.filter(
        (o) => String((o == null ? void 0 : o.slug) ?? "").toLowerCase() !== "electric-hpwh"
      );
    });
    const selectedHeatingSlug = /* @__PURE__ */ ref("");
    const selectedHeating = computed(
      () => heatingOptions.value.find(
        (l) => l.slug === selectedHeatingSlug.value
      ) || null
    );
    const selectedHeatingName = computed(() => {
      var _a2;
      return ((_a2 = selectedHeating.value) == null ? void 0 : _a2.name) || "";
    });
    const waterHeatingOptions = computed(() => {
      var _a2, _b2;
      const opts = sortOtherLast(
        ((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["heating-types"]) ?? []
      ).map((o) => {
        if (String((o == null ? void 0 : o.slug) ?? "").toLowerCase() !== "electricity") {
          return o;
        }
        return {
          ...o,
          // name: `${o.name} (e.g. tank or tankless)`
          name: `Electric (e.g. tank or tankless)`
        };
      });
      return opts.filter((o) => {
        const slug = String((o == null ? void 0 : o.slug) ?? "").toLowerCase();
        const name = String((o == null ? void 0 : o.name) ?? "").toLowerCase();
        return slug !== "wood" && !name.includes("wood") && slug !== "electric-hp";
      });
    });
    const selectedWaterHeatingSlug = /* @__PURE__ */ ref("");
    const selectedWaterHeating = computed(
      () => waterHeatingOptions.value.find(
        (l) => l.slug === selectedWaterHeatingSlug.value
      ) || null
    );
    const selectedWaterHeatingName = computed(
      () => {
        var _a2;
        return ((_a2 = selectedWaterHeating.value) == null ? void 0 : _a2.name) || "";
      }
    );
    watch(
      [selectedWaterHeatingSlug, waterHeatingOptions],
      ([slug, opts]) => {
        if (!slug) return;
        const exists = opts.some((o) => o.slug === slug);
        if (!exists) {
          selectedWaterHeatingSlug.value = "";
        }
      },
      { immediate: true }
    );
    const utilityOptions = computed(
      () => {
        var _a2, _b2;
        return sortOtherLast(((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["utilities"]) ?? []);
      }
    );
    const selectedUtilitySlug = /* @__PURE__ */ ref("");
    const selectedUtility = computed(
      () => utilityOptions.value.find(
        (l) => l.slug === selectedUtilitySlug.value
      ) || null
    );
    const selectedUtilityName = computed(() => {
      var _a2;
      return ((_a2 = selectedUtility.value) == null ? void 0 : _a2.name) || "";
    });
    const gasOptions = computed(
      () => {
        var _a2, _b2;
        return sortOtherLast(((_b2 = (_a2 = api.value) == null ? void 0 : _a2["settings-selects"]) == null ? void 0 : _b2["gas"]) ?? []);
      }
    );
    const selectedGasSlug = /* @__PURE__ */ ref("");
    const selectedGas = computed(
      () => gasOptions.value.find((g) => g.slug === selectedGasSlug.value) || null
    );
    const selectedGasName = computed(() => {
      var _a2;
      return ((_a2 = selectedGas.value) == null ? void 0 : _a2.name) || "";
    });
    const isNaturalGasOrPropaneOption = (opt) => {
      if (!opt) return false;
      const slug = String(opt.slug ?? "").toLowerCase();
      const name = String(opt.name ?? "").toLowerCase();
      return /natural\s*gas/.test(name) || /propane/.test(name) || /natural[-\s]*gas/.test(slug) || /propane/.test(slug);
    };
    const findNoGasOptionSlug = (opts = []) => {
      const match = opts.find((opt) => {
        const slug = String((opt == null ? void 0 : opt.slug) ?? "").toLowerCase();
        const name = String((opt == null ? void 0 : opt.name) ?? "").toLowerCase();
        return /no\s*gas/.test(name) || /no[-\s]*gas/.test(slug) || /no\s*provider/.test(name) || /no[-\s]*provider/.test(slug);
      });
      return (match == null ? void 0 : match.slug) || "";
    };
    const isNoGasProviderOption = (opt) => {
      if (!opt) return false;
      const slug = String(opt.slug ?? "").toLowerCase();
      const name = String(opt.name ?? "").toLowerCase();
      return /no\s*gas/.test(name) || /no[-\s]*gas/.test(slug) || /no\s*provider/.test(name) || /no[-\s]*provider/.test(slug);
    };
    watch(
      [selectedHeatingSlug, selectedWaterHeatingSlug, gasOptions],
      () => {
        if (selectedGasSlug.value) return;
        if (!selectedHeatingSlug.value || !selectedWaterHeatingSlug.value)
          return;
        if (isNaturalGasOrPropaneOption(selectedHeating.value) || isNaturalGasOrPropaneOption(selectedWaterHeating.value)) {
          return;
        }
        const noGasSlug = findNoGasOptionSlug(gasOptions.value);
        if (!noGasSlug) return;
        selectedGasSlug.value = noGasSlug;
        if (bootstrapped.value) {
          isExternalDirty.value = true;
        }
        updateAddressBar();
        debouncedUpdateRebateDetails();
      },
      { immediate: true }
    );
    watch(
      [selectedHeatingSlug, selectedWaterHeatingSlug, gasOptions],
      () => {
        if (!selectedGasSlug.value) return;
        const currentGasOption = gasOptions.value.find((g) => g.slug === selectedGasSlug.value) || null;
        if (!isNoGasProviderOption(currentGasOption)) return;
        const heatingIsGasOrPropane = isNaturalGasOrPropaneOption(
          selectedHeating.value
        );
        const waterHeatingIsGasOrPropane = isNaturalGasOrPropaneOption(
          selectedWaterHeating.value
        );
        if (heatingIsGasOrPropane || waterHeatingIsGasOrPropane) {
          selectedGasSlug.value = "";
        }
      },
      { immediate: true }
    );
    const hasAnySelection = computed(
      () => !!(selectedBuildingTypeName.value || murbTenure.value || selectedHomeValueName.value || selectedPersonsCount.value || selectedIncomeRangeName.value || selectedLocationName.value || selectedHeatingName.value || selectedWaterHeatingName.value || selectedUtilityName.value || selectedGasName.value)
    );
    const hasAllSelection = computed(() => {
      const hasBuilding = !!selectedBuildingTypeSlug.value;
      const hasMurbTenure = selectedBuildingGroupSlug.value === "murb" ? !!murbTenure.value : true;
      const hasHomeValue = !!selectedHomeValueSlug.value;
      const hasPersons = !!selectedPersonsSlug.value;
      const hasIncome = !!selectedIncomeRangeSlug.value;
      const hasLocation = !!selectedLocationSlug.value;
      const requiresRoomHeating = !(mode.value === "single" && singleModePageRebateKind.value === "hpwh");
      const requiresWaterHeating = !(mode.value === "single" && singleModePageRebateKind.value === "hp");
      const hasHeating = requiresRoomHeating ? !!selectedHeatingSlug.value : true;
      const hasWaterHeating = requiresWaterHeating ? !!selectedWaterHeatingSlug.value : true;
      const hasUtility = !!selectedUtilitySlug.value;
      const hasGas = !!selectedGasSlug.value;
      return hasBuilding && hasMurbTenure && hasHomeValue && hasPersons && hasIncome && hasLocation && hasHeating && hasWaterHeating && hasUtility && hasGas;
    });
    const isSingleModeEditToggleLocked = computed(
      () => mode.value === "single" && !assistiveSimpleMode.value && !hasAllSelection.value
    );
    const isSingleModeEditModeActive = computed(
      () => editModeView.value && !(mode.value === "single" && isCollapseView.value)
    );
    const isSingleModeEditToggleDisabled = computed(
      () => mode.value === "single" && !assistiveSimpleMode.value && (isCollapseView.value || isSingleModeEditToggleLocked.value)
    );
    const editModeToggleLabel = computed(
      () => mode.value === "single" && isCollapseView.value ? "Expand home details to change edit mode." : isSingleModeEditToggleLocked.value ? "Edit mode is locked until all home details are completed." : isSingleModeEditModeActive.value ? "Exit edit mode" : "Enter edit mode"
    );
    watchEffect(() => {
      if (mode.value !== "single" || assistiveSimpleMode.value) return;
      if (isCollapseView.value) {
        activeEdit.value = "";
        if (editModeView.value) {
          editModeView.value = false;
        }
        return;
      }
      if (isSingleModeEditToggleLocked.value && !editModeView.value) {
        editModeView.value = true;
      }
    });
    watch(isSingleModeEditToggleLocked, (isLocked, wasLocked) => {
      if (!isLocked && wasLocked && mode.value === "single" && !assistiveSimpleMode.value && !isCollapseView.value) {
        editModeView.value = singleModeEditModePreference.value;
      }
    });
    watch(
      [bootstrapped, isReadyToRender, mode, hasAllSelection],
      async ([isBootstrapped, readyToRender, currentMode, allSelected]) => {
        if (!isBootstrapped || !readyToRender) return;
        if (currentMode !== "archive" || !allSelected) return;
        if (hasArchiveAutoScrolledToResults.value) return;
        await nextTick();
        scrollToArchiveResultsOnce();
      },
      { immediate: true }
    );
    const assembledUrl = computed(() => assembleUrl());
    const assembledQueryString = computed(() => {
      const q = assembledUrl.value.split("?")[1];
      return q ? `?${q}` : "";
    });
    const currentQueryString = /* @__PURE__ */ ref(window.location.search);
    function syncCurrentQueryStringFromWindow() {
      currentQueryString.value = window.location.search;
    }
    function queueHeatingTitleUpdate() {
      if (mode.value !== "single") return;
      if (!isReadyToRender.value) {
        setSingleModeHeatingTitleVisibility(false);
        return;
      }
      if (isSingleModeTitleAwaitingAjax.value) return;
      nextTick(() => {
        applySingleModeHeatingTitle();
      });
    }
    function handleWindowLocationChange() {
      syncCurrentQueryStringFromWindow();
    }
    const urlOutOfSync = computed(
      () => assembledQueryString.value !== currentQueryString.value
    );
    const isDirty2 = urlOutOfSync;
    watch(urlOutOfSync, (val) => applyDirtyClasses(val), { immediate: true });
    watch(selectedLocationName, (newName) => {
      locationInputValue.value = newName || "";
    });
    function detectSingleModeRebateTypeClass(el) {
      if (typeof document === "undefined") return "";
      if (typeof window !== "undefined") {
        if (window.location.pathname.toLowerCase().includes("heat-pump-water-heater")) {
          return heatPumpWaterHeaterRebateSlug;
        }
      }
      return "";
    }
    onMounted(() => {
      var _a2, _b2, _c2, _d, _e, _f, _g;
      const el = document.getElementById("vnextRebateFilterApp");
      if ((_a2 = el == null ? void 0 : el.dataset) == null ? void 0 : _a2.mode) mode.value = el.dataset.mode;
      if ((_b2 = el == null ? void 0 : el.dataset) == null ? void 0 : _b2.pageHeatingType) {
        pageHeatingType.value = el.dataset.pageHeatingType;
      }
      if ((_c2 = el == null ? void 0 : el.dataset) == null ? void 0 : _c2.pageHeatingTypes) {
        pageHeatingTypes.value = el.dataset.pageHeatingTypes.split(",").map((item) => item.trim()).filter(Boolean);
      }
      if ((_d = el == null ? void 0 : el.dataset) == null ? void 0 : _d.pageWaterHeatingType) {
        pageWaterHeatingType.value = el.dataset.pageWaterHeatingType;
      }
      if ((_e = el == null ? void 0 : el.dataset) == null ? void 0 : _e.pageWaterHeatingTypes) {
        pageWaterHeatingTypes.value = el.dataset.pageWaterHeatingTypes.split(",").map((item) => item.trim()).filter(Boolean);
      }
      if ((_f = el == null ? void 0 : el.dataset) == null ? void 0 : _f.pageBuildingGroup) {
        pageBuildingGroup.value = el.dataset.pageBuildingGroup;
      }
      if ((_g = el == null ? void 0 : el.dataset) == null ? void 0 : _g.pageRebateType) {
        pageRebateType.value = el.dataset.pageRebateType;
      }
      singleModeRebateTypeClass.value = detectSingleModeRebateTypeClass();
      const savedLabelsVisible = localStorage.getItem("rebateLabelsVisible");
      if (savedLabelsVisible !== null) {
        labelsVisible.value = JSON.parse(savedLabelsVisible);
      }
      const savedReadOnly = localStorage.getItem("rebateShowReadOnlyFields");
      if (savedReadOnly !== null) {
        showReadOnlyFields.value = JSON.parse(savedReadOnly);
      }
      const savedEditUI = localStorage.getItem("rebateShowEditModeUI");
      if (savedEditUI !== null) {
        showEditModeUI.value = JSON.parse(savedEditUI);
      }
      const savedEditModeView = localStorage.getItem("rebateEditModeView");
      if (savedEditModeView !== null) {
        const parsedEditModeView = JSON.parse(savedEditModeView) === true;
        editModeView.value = parsedEditModeView;
        singleModeEditModePreference.value = parsedEditModeView;
      }
      const savedAssistiveSimpleMode = localStorage.getItem(
        ASSISTIVE_SIMPLE_MODE_KEY
      );
      if (savedAssistiveSimpleMode === "true") {
        assistiveSimpleMode.value = true;
        editModeView.value = false;
        editable.value = true;
        activeEdit.value = "";
        isCollapseView.value = false;
      }
      if (!assistiveSimpleMode.value && mode.value === "single") {
        isCollapseView.value = !singleModeOpenFromPlannerSource.value;
        editModeView.value = false;
      }
      const observer = new MutationObserver(() => {
        applyDirtyClasses(urlOutOfSync.value);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        displayGridOrList.value = saved === "true";
      }
      viewPreferenceLoaded.value = true;
      document.addEventListener(
        "pointerdown",
        handleSingleModeOutsidePointerDown,
        true
      );
      window.addEventListener("popstate", handleWindowLocationChange);
    });
    onBeforeUnmount(() => {
      document.removeEventListener(
        "pointerdown",
        handleSingleModeOutsidePointerDown,
        true
      );
      window.removeEventListener("popstate", handleWindowLocationChange);
      if (typeof window !== "undefined" && singleModeTitleRevealFrame) {
        window.cancelAnimationFrame(singleModeTitleRevealFrame);
        singleModeTitleRevealFrame = 0;
      }
      if (typeof window !== "undefined" && singleModeTitleSwapTimeout) {
        window.clearTimeout(singleModeTitleSwapTimeout);
        singleModeTitleSwapTimeout = 0;
      }
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove(
          SINGLE_MODE_TITLE_PENDING_CLASS
        );
      }
    });
    function assembleUrl() {
      const baseUrl = window.location.origin + window.location.pathname;
      const urlParams = new URLSearchParams();
      urlParams.set("tool", "rebates");
      if (selectedBuildingTypeSlug.value)
        urlParams.set("type", selectedBuildingTypeSlug.value);
      if (selectedBuildingGroupSlug.value)
        urlParams.set("group", selectedBuildingGroupSlug.value);
      if (murbTenure.value) urlParams.set("tenure", murbTenure.value);
      if (selectedHomeValueSlug.value)
        urlParams.set("home_value", selectedHomeValueSlug.value);
      if (selectedPersonsSlug.value)
        urlParams.set("persons", selectedPersonsSlug.value);
      if (selectedIncomeRangeSlug.value)
        urlParams.set("income", selectedIncomeRangeSlug.value);
      if (hasAllSelection.value && espTier.value) {
        urlParams.set("rebate_tier", espTier.value);
      } else {
        urlParams.delete("rebate_tier");
      }
      if (mode.value === "single") {
        const isInvalid = hasAnyError.value || !hasAllSelection.value || !singleModePageEligible.value;
        urlParams.set("state", isInvalid ? "invalid" : "valid");
        if (singleModeOpenFromPlannerSource.value && !hasAllSelection.value) {
          urlParams.set("source", "planner");
        } else {
          urlParams.delete("source");
        }
      } else {
        urlParams.delete("state");
      }
      if (selectedLocationSlug.value) {
        urlParams.set("location", selectedLocationName.value);
        if (selectedRegionName.value)
          urlParams.set("region", selectedRegionName.value);
      }
      if (selectedHeatingSlug.value) {
        urlParams.set("heating", getHeatingUrlValue(selectedHeating.value));
      }
      if (selectedWaterHeatingSlug.value) {
        urlParams.set(
          "water_heating",
          getHeatingUrlValue(selectedWaterHeating.value)
        );
      }
      if (selectedUtilitySlug.value)
        urlParams.set("utility", selectedUtilityName.value);
      if (selectedGasSlug.value) urlParams.set("gas", selectedGasName.value);
      return `${baseUrl}?${urlParams.toString()}`;
    }
    const normalizeHeatingLabelForMatch = (value) => String(value || "").toLowerCase().replace(/\s*\(e\.g\.[^)]+\)\s*/g, "").replace(/\s+/g, " ").trim();
    const findHeatingOptionByValue = (options, value) => {
      if (!value) return null;
      const raw = String(value).trim();
      const rawSlug = raw.toLowerCase();
      const normalized = normalizeHeatingLabelForMatch(raw);
      const isElectricAlias = normalized === "electric" || normalized === "electricity";
      return options.find(
        (opt) => String((opt == null ? void 0 : opt.slug) || "").toLowerCase() === rawSlug
      ) || options.find(
        (opt) => normalizeHeatingLabelForMatch(opt == null ? void 0 : opt.name) === normalized
      ) || (isElectricAlias ? options.find(
        (opt) => String((opt == null ? void 0 : opt.slug) || "").toLowerCase() === "electricity"
      ) : null);
    };
    const getHeatingUrlValue = (option) => {
      if (!option) return "";
      return String(option.slug || "").toLowerCase() === "electricity" ? "Electricity" : option.name;
    };
    const singleModeTitleHtmlByKind = {
      hp: {
        electricity: 'For homes heated with <span class="electricity">electricity</span>',
        gas: 'For homes heated with <span class="gas">natural gas or propane</span>',
        oil: 'For homes heated with <span class="oil">oil</span>',
        wood: 'For homes heated with <span class="wood">wood</span>',
        other: 'For homes heated with <span class="other">other or unsure</span>'
      },
      hpwh: {
        electricity: 'For homes with <span class="electricity">electric</span> water heating',
        "electric-hpwh": 'For homes with <span class="electric-hpwh">electric heat pump water heater</span> water heating',
        gas: 'For homes with <span class="gas">natural gas or propane</span> water heating',
        oil: 'For homes with <span class="oil">oil</span> water heating',
        other: 'For homes with <span class="other">other or unsure</span> water heating'
      }
    };
    const currentUrlParams = computed(() => {
      return new URLSearchParams(
        (currentQueryString.value || "").replace(/^\?/, "")
      );
    });
    const currentUrlHeatingValue = computed(
      () => currentUrlParams.value.get("heating") || ""
    );
    const currentUrlWaterHeatingValue = computed(
      () => currentUrlParams.value.get("water_heating") || ""
    );
    const currentUrlHeatingOption = computed(
      () => findHeatingOptionByValue(heatingOptions.value, currentUrlHeatingValue.value)
    );
    const currentUrlWaterHeatingOption = computed(
      () => findHeatingOptionByValue(
        waterHeatingOptions.value,
        currentUrlWaterHeatingValue.value
      )
    );
    const singleModeCurrentTitleHeatingKey = computed(() => {
      var _a2, _b2, _c2, _d;
      if (singleModePageRebateKind.value === "hp") {
        return normalizeHeatingTitleKey(
          ((_a2 = currentUrlHeatingOption.value) == null ? void 0 : _a2.slug) || ((_b2 = currentUrlHeatingOption.value) == null ? void 0 : _b2.name) || currentUrlHeatingValue.value
        );
      }
      if (singleModePageRebateKind.value === "hpwh") {
        return normalizeHeatingTitleKey(
          ((_c2 = currentUrlWaterHeatingOption.value) == null ? void 0 : _c2.slug) || ((_d = currentUrlWaterHeatingOption.value) == null ? void 0 : _d.name) || currentUrlWaterHeatingValue.value
        );
      }
      return "";
    });
    const singleModeCurrentPageAllowedTitleKeys = computed(() => {
      if (singleModePageRebateKind.value === "hp") {
        const sources = pageHeatingTypes.value.length > 0 ? pageHeatingTypes.value : [pageHeatingType.value];
        return Array.from(
          new Set(
            sources.flatMap((item) => extractHeatingTitleKeys(item)).filter(Boolean)
          )
        );
      }
      if (singleModePageRebateKind.value === "hpwh") {
        return Array.from(
          new Set(
            resolvedPageWaterHeatingSources.value.flatMap((item) => extractHeatingTitleKeys(item)).filter(Boolean)
          )
        );
      }
      return [];
    });
    const singleModeCanRetainLastValidTitle = computed(
      () => mode.value === "single" && Boolean(singleModePageRebateKind.value) && singleModeCurrentPageAllowedTitleKeys.value.length > 1
    );
    const singleModeResolvedTitleHtml = computed(() => {
      var _a2;
      if (!singleModeCanRetainLastValidTitle.value) return "";
      const selectedKey = singleModeCurrentTitleHeatingKey.value;
      if (!selectedKey) return "";
      if (!singleModeCurrentPageAllowedTitleKeys.value.includes(selectedKey)) {
        return "";
      }
      return ((_a2 = singleModeTitleHtmlByKind[singleModePageRebateKind.value]) == null ? void 0 : _a2[selectedKey]) || "";
    });
    watch(
      [
        currentPagePathname,
        singleModePageRebateKind,
        pageRebateType,
        pageHeatingType,
        pageWaterHeatingType,
        pageWaterHeatingTypes
      ],
      () => {
        singleModeTitleOriginalText.value = "";
        singleModeLastValidTitleHtml.value = "";
      },
      { flush: "post" }
    );
    function initFromQueryString() {
      const urlParams = new URLSearchParams(window.location.search);
      const tool = urlParams.get("tool");
      if (tool && tool !== "rebates") return;
      const type = urlParams.get("type");
      const group = urlParams.get("group");
      const tenure = urlParams.get("tenure");
      const homeValue = urlParams.get("home_value");
      const persons = urlParams.get("persons");
      const income = urlParams.get("income");
      const location = urlParams.get("location");
      const heating = urlParams.get("heating");
      const waterHeating = urlParams.get("water_heating");
      const utility = urlParams.get("utility");
      const gas = urlParams.get("gas");
      const restoredBuildingTypeSlug = getRestoredBuildingTypeSlug({
        type,
        group,
        mode: mode.value,
        buildingTypeGroups: buildingTypeGroups.value
      });
      if (restoredBuildingTypeSlug) {
        selectedBuildingTypeSlug.value = restoredBuildingTypeSlug;
      }
      if (tenure && (tenure === "own" || tenure === "rent"))
        murbTenure.value = tenure;
      if (homeValue) {
        const foundHV = homeValueOptions.value.find(
          (h2) => h2.slug === homeValue
        );
        if (foundHV) selectedHomeValueSlug.value = homeValue;
      }
      if (persons) {
        const personsOk = personCountOptions.value.some(
          (p2) => p2.slug === persons
        );
        if (personsOk) selectedPersonsSlug.value = persons;
      }
      if (income) {
        const incomeOk = incomeRangeOptions.value.some(
          (r) => r.slug === income
        );
        if (incomeOk) selectedIncomeRangeSlug.value = income;
      }
      if (location) {
        const foundLoc = locationOptionsForInput.value.find(
          (l) => l.name === location
        );
        if (foundLoc) selectedLocationSlug.value = foundLoc.slug;
      }
      if (heating) {
        const foundHeat = findHeatingOptionByValue(
          heatingOptions.value,
          heating
        );
        if (foundHeat) selectedHeatingSlug.value = foundHeat.slug;
      }
      if (waterHeating) {
        const foundWaterHeat = findHeatingOptionByValue(
          waterHeatingOptions.value,
          waterHeating
        );
        if (foundWaterHeat)
          selectedWaterHeatingSlug.value = foundWaterHeat.slug;
      }
      if (utility) {
        const foundUtil = utilityOptions.value.find((l) => l.name === utility);
        if (foundUtil) selectedUtilitySlug.value = foundUtil.slug;
      }
      if (gas) {
        const foundGas = gasOptions.value.find((g) => g.name === gas);
        if (foundGas) selectedGasSlug.value = foundGas.slug;
      }
    }
    const urlStateDeps = computed(() => ({
      type: selectedBuildingTypeSlug.value,
      group: selectedBuildingGroupSlug.value,
      tenure: murbTenure.value,
      home_value: selectedHomeValueSlug.value,
      persons: selectedPersonsSlug.value,
      income: selectedIncomeRangeSlug.value,
      location: selectedLocationSlug.value,
      heating: selectedHeatingSlug.value,
      water_heating: selectedWaterHeatingSlug.value,
      utility: selectedUtilitySlug.value,
      gas: selectedGasSlug.value,
      region: selectedRegion.value
    }));
    watch(
      [
        mode,
        isReadyToRender,
        currentQueryString,
        singleModeResolvedTitleHtml,
        singleModeCanRetainLastValidTitle,
        isSingleModeTitleAwaitingAjax
      ],
      ([currentMode, readyToRender, , , , awaitingAjax]) => {
        if (currentMode !== "single") {
          setSingleModeHeatingTitleVisibility(true);
          return;
        }
        if (!readyToRender) {
          setSingleModeHeatingTitleVisibility(false);
          return;
        }
        if (awaitingAjax) return;
        queueHeatingTitleUpdate();
      },
      { immediate: true, flush: "post" }
    );
    watch(
      urlStateDeps,
      (currentState, previousState) => {
        if (!bootstrapped.value) return;
        if (!isReadyToRender.value) return;
        if (mode.value !== "single") return;
        if (!previousState) return;
        if (!singleModePageLoadDialogHandled.value) return;
        if (isSingleModeDialogOpen.value) return;
        const changedField = getSingleModeChangedField(
          currentState,
          previousState
        );
        if (!changedField) return;
        void maybeOpenSingleModeAlternateRebateDialog(changedField);
      },
      { deep: true, flush: "post" }
    );
    watch([hasAnyError, mode, singleModePageEligible], () => {
      if (!bootstrapped.value) return;
      if (mode.value !== "single") return;
      updateAddressBar();
    });
    function updateAddressBar() {
      const url = assembledUrl.value;
      try {
        window.history.replaceState(null, "", url);
        currentQueryString.value = assembledQueryString.value;
      } catch (e) {
      }
    }
    const espTier = computed(() => {
      const incomeSlug = selectedIncomeRangeSlug.value;
      if (!incomeSlug) return "";
      if (!hasAllSelection.value) return "";
      const selectedHV = homeValueOptions.value.find(
        (v) => v.slug === selectedHomeValueSlug.value
      );
      const hvSlug = (selectedHV == null ? void 0 : selectedHV.slug) || "";
      const isMurb = selectedBuildingGroupSlug.value === "murb";
      let derivedTier = "";
      if (/-t1$/.test(incomeSlug)) derivedTier = "ESP-1";
      else if (/-t2$/.test(incomeSlug)) derivedTier = "ESP-2";
      else if (/-t3$/.test(incomeSlug)) derivedTier = "ESP-3";
      else if (/-t0$/.test(incomeSlug)) derivedTier = "HRR";
      else return "";
      if (isMurb) {
        const overLimit = hvSlug === "over-754000";
        return overLimit ? "HRR" : derivedTier;
      }
      if (hvSlug === "over-1820000") {
        return "HRR";
      }
      if (hvSlug === "over-1230000") {
        if (derivedTier === "HRR") return "HRR";
        return "ESP-3";
      }
      if (hvSlug === "1230000-or-less") {
        return derivedTier;
      }
      return "";
    });
    watch(
      [selectedLocationSlug, selectedLocationName, locationOptionsForInput],
      () => {
        if (!bootstrapped.value) return;
        hydratePreferredSettingsFromRebateToolSettings();
      },
      { deep: false, immediate: true }
    );
    watch(
      espTier,
      (newTier) => {
        if (!bootstrapped.value) return;
        if (!newTier) return;
        writePreferredSettings({ esp_tier: newTier });
      },
      { immediate: true }
    );
    const normalizeUtilitySlug = (val) => {
      if (!val) return "";
      const v = val.toLowerCase().trim();
      if (v.includes("bc hydro")) return "bc-hydro";
      if (v.includes("fortis")) return "fortisbc";
      if (v.includes("grand forks")) return "grand-forks";
      if (v.includes("nelson")) return "nelson";
      if (v.includes("new west")) return "new-westminster";
      if (v.includes("penticton")) return "penticton";
      if (v.includes("summerland")) return "summerland";
      return v.replace(/\s+/g, "-");
    };
    const normalizeGasSlug = (val) => {
      if (!val) return "";
      const v = val.toLowerCase().trim();
      if (v.includes("fortis")) return "fortisbc-gas";
      if (v.includes("no gas")) return "no-gas";
      if (v.includes("pacific")) return "png-gas";
      if (v.includes("tank propane")) return "tank-gas";
      return v.replace(/\s+/g, "-");
    };
    const normalizeRegionSlug = (val) => {
      if (!val) return "";
      return val.toLowerCase().trim();
    };
    const normalizeLocationSlug = (val) => {
      if (!val) return "";
      return val.toLowerCase().trim().replace(/\s+/g, "-");
    };
    const filteredResults = computed(() => {
      var _a2, _b2, _c2, _d;
      const normalizedHeating = normalizeHeatingSlug(selectedHeatingName.value);
      const normalizedWaterHeating = normalizeHeatingSlug(
        selectedWaterHeatingName.value
      );
      const normalizedUtility = normalizeUtilitySlug(selectedUtilityName.value);
      const normalizedGas = normalizeGasSlug(selectedGasName.value);
      const normalizedRegion = normalizeRegionSlug(selectedRegionName.value);
      const normalizedLocation = normalizeLocationSlug(
        selectedLocationName.value
      );
      const normalizedEspTier = (_b2 = (_a2 = espTier.value) == null ? void 0 : _a2.toLowerCase) == null ? void 0 : _b2.call(_a2);
      const normalizedBuildingGroup = (_d = (_c2 = selectedBuildingGroupSlug.value) == null ? void 0 : _c2.toLowerCase) == null ? void 0 : _d.call(_c2);
      const results = api.value.results.filter((item) => {
        const applicable = Array.isArray(item.applicable_rebates) ? item.applicable_rebates.map((r) => {
          var _a3, _b3;
          return (_b3 = (_a3 = r == null ? void 0 : r.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3);
        }).filter(Boolean) : [];
        const applicableSet = new Set(applicable);
        const showInResults = !applicableSet.has("no-show");
        if (!showInResults) return false;
        const hasApplicableRebates = applicable.length > 0;
        const rebateTierEligible = hasApplicableRebates ? normalizedEspTier ? applicableSet.has(normalizedEspTier) : true : !normalizedEspTier || ["esp-1", "esp-2", "esp-3"].includes(normalizedEspTier);
        const hasHRR = applicableSet.has("hrr");
        const isHrrTier = normalizedEspTier === "hrr";
        const hasESP3 = applicableSet.has("esp-3");
        const isHighTier = ["esp-3", "hrr"].includes(normalizedEspTier);
        const hrrEligible = hasHRR && !hasESP3 && isHighTier;
        const tierEligible = rebateTierEligible || hrrEligible;
        const hasTypeInfo = Array.isArray(item.types) && item.types.length > 0;
        const buildingTypeEligible = hasTypeInfo ? item.types.some(
          (t) => {
            var _a3, _b3;
            return ((_b3 = (_a3 = t == null ? void 0 : t.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3)) === normalizedBuildingGroup;
          }
        ) : true;
        const rebateClass = (item.rebate_type_class || "").toLowerCase();
        const heatingTypeSlugs = Array.isArray(item.heating_types) ? item.heating_types.map((sys) => {
          var _a3, _b3;
          return (_b3 = (_a3 = sys == null ? void 0 : sys.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3);
        }).filter(Boolean) : [];
        const roomHeatingEligible = !normalizedHeating || heatingTypeSlugs.length === 0 || heatingTypeSlugs.includes(normalizedHeating);
        const waterHeatingEligible = !normalizedWaterHeating || heatingTypeSlugs.length === 0 || heatingTypeSlugs.includes(normalizedWaterHeating);
        let heatingEligible;
        if (rebateClass === "heat-pump-water-heater-rebates") {
          heatingEligible = waterHeatingEligible;
        } else if (rebateClass === "heat-pump-rebates") {
          heatingEligible = roomHeatingEligible;
        } else {
          heatingEligible = roomHeatingEligible;
        }
        if (!heatingEligible) {
          return false;
        }
        const isMurbBuilding = normalizedBuildingGroup === "murb";
        const isGodBuilding = normalizedBuildingGroup === "ground-oriented-dwellings";
        const isHP = rebateClass === "heat-pump-rebates";
        const isHPWH = rebateClass === "heat-pump-water-heater-rebates";
        const isWindowsDoors = rebateClass === "window-and-door-rebates";
        const isInsulation = rebateClass === "insulation-rebates";
        const utilityIsBCHydro = normalizedUtility === "bc-hydro";
        const utilityIsBCHydroOrNW = normalizedUtility === "bc-hydro" || normalizedUtility === "new-westminster";
        const roomIsWood = normalizedHeating === "wood";
        const waterIsElectric = normalizedWaterHeating === "electricity";
        const waterIsWood = normalizedWaterHeating === "wood";
        const roomIsElectricHP = selectedHeatingSlug.value === "electric-hp";
        const waterIsElectricHPWH = selectedWaterHeatingSlug.value === "electric-hpwh";
        applicableSet.has("hrr") && applicableSet.has("north");
        const userRegionNorth = normalizedRegion === "north";
        const currentUtility = normalizedUtility;
        const locationIsVancouver = normalizedLocation === "vancouver";
        const utilityIsOther = selectedUtilitySlug.value === "other" || normalizedUtility === "other";
        if (utilityIsOther) {
          return false;
        }
        const godHPIneligible = isGroundOrientedHeatPumpIneligible({
          isGodBuilding,
          isHighTier,
          isHP,
          isHPWH,
          roomIsWood,
          waterIsWood
        });
        if (godHPIneligible) {
          return false;
        }
        const godWindowsWoodVanIneligible = isGodBuilding && isHighTier && isWindowsDoors && roomIsWood || // room cannot be wood
        locationIsVancouver && isWindowsDoors;
        if (godWindowsWoodVanIneligible) {
          return false;
        }
        const godInsulationWoodIneligible = isGodBuilding && isHighTier && isInsulation && roomIsWood;
        if (godInsulationWoodIneligible) {
          return false;
        }
        const hpwhIneligible = isHPWH && isMurbBuilding && !waterIsElectric || // water heating must be electricity
        isHPWH && isMurbBuilding && isHighTier && !utilityIsBCHydroOrNW;
        if (hpwhIneligible) {
          return false;
        }
        if (isHP && roomIsElectricHP) {
          return false;
        }
        if (isHPWH && waterIsElectricHPWH) {
          return false;
        }
        const murbUtilityBlocked = isMurbBuilding && isHrrTier && !isHPWH && currentUtility && !utilityIsBCHydroOrNW;
        if (murbUtilityBlocked) {
          return false;
        }
        const regionAndHRRBCHydro = (() => {
          const rebateHRRNorthRestricted = isHrrTier && applicableSet.has("north");
          if (!rebateHRRNorthRestricted) {
            return true;
          }
          const tierIsConstrained = isHrrTier;
          if (!(isGodBuilding && tierIsConstrained)) {
            return true;
          }
          const blocked = !userRegionNorth || // HRR user must be in North
          userRegionNorth && !utilityIsBCHydro;
          if (blocked) {
            return false;
          }
          return true;
        })();
        if (!regionAndHRRBCHydro) return false;
        const regionSlugs = Array.isArray(item.regions) ? item.regions.map((r) => {
          var _a3;
          return (_a3 = r == null ? void 0 : r.toLowerCase) == null ? void 0 : _a3.call(r);
        }).filter(Boolean) : [];
        const regionEligible = !normalizedRegion || regionSlugs.length === 0 || regionSlugs.includes(normalizedRegion);
        const utilitySlugs = Array.isArray(item.utilities) ? item.utilities.map((u) => {
          var _a3, _b3;
          return (_b3 = (_a3 = u == null ? void 0 : u.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3);
        }).filter(Boolean) : [];
        const utilityEligible = !normalizedUtility || utilitySlugs.length === 0 || utilitySlugs.includes(normalizedUtility);
        const gasSlugs = Array.isArray(item.gas) ? item.gas.map((g) => {
          var _a3, _b3;
          return (_b3 = (_a3 = g == null ? void 0 : g.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3);
        }).filter(Boolean) : [];
        const gasEligible = !normalizedGas || gasSlugs.length === 0 || gasSlugs.includes(normalizedGas);
        !normalizedLocation || !Array.isArray(item.locations) || item.locations.length === 0 || item.locations.some(
          (l) => {
            var _a3, _b3;
            return ((_b3 = (_a3 = l == null ? void 0 : l.slug) == null ? void 0 : _a3.toLowerCase) == null ? void 0 : _b3.call(_a3)) === normalizedLocation;
          }
        );
        const geoOrServiceSlugMatch = regionSlugs.some((slug) => applicableSet.has(slug)) || utilitySlugs.some((slug) => applicableSet.has(slug)) || gasSlugs.some((slug) => applicableSet.has(slug));
        const tierOrSlugEligible = tierEligible || geoOrServiceSlugMatch;
        const strictEligibility = tierOrSlugEligible && buildingTypeEligible;
        const baseEligibility = tierOrSlugEligible && regionEligible && utilityEligible && buildingTypeEligible;
        const additiveEligibility = utilitySlugs.some((slug) => applicableSet.has(slug)) || gasEligible || regionEligible;
        const shouldInclude = strictEligibility || !baseEligibility && buildingTypeEligible && additiveEligibility;
        return shouldInclude;
      });
      nextTick(() => runOptionalGlobal("cleanbcdxBhRebatesArchiveLoader"));
      return results.sort((a, b) => {
        const nameA = (a.rebate_type_headline_card || "").toLowerCase();
        const nameB = (b.rebate_type_headline_card || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });
    watch(
      [
        mode,
        isReadyToRender,
        hasAllSelection,
        singleModePrimaryFieldsCompleteForCurrentPage,
        () => filteredResults.value.length
      ],
      () => {
        void maybeOpenSingleModeInvalidQueryDialogOnLoad();
      },
      { immediate: true }
    );
    watch(
      [mode, () => filteredResults.value.length, viewPreferenceLoaded],
      ([currentMode, resultCount, isLoaded], oldValues = []) => {
        if (!isLoaded) return;
        if (currentMode !== "archive") return;
        const previousResultCount = oldValues[1];
        const enteredSingleResult = resultCount === 1 && previousResultCount !== 1;
        if (enteredSingleResult) {
          displayGridOrList.value = false;
          persistDisplayViewPreference();
        }
      },
      { immediate: true }
    );
    function withQueryString(baseUrl, queryOverrides = null) {
      if (!baseUrl) return "#";
      const qs = assembledQueryString.value;
      if (!qs && !queryOverrides) return baseUrl;
      try {
        const urlObj = new URL(baseUrl, window.location.origin);
        const params = new URLSearchParams((qs || "").replace(/^\?/, ""));
        if (queryOverrides && typeof queryOverrides === "object") {
          Object.entries(queryOverrides).forEach(([key, value]) => {
            if (value === null || value === void 0 || value === "") {
              params.delete(key);
              return;
            }
            params.set(key, String(value));
          });
        }
        const queryString = params.toString();
        return queryString ? `${urlObj.origin}${urlObj.pathname}?${queryString}` : `${urlObj.origin}${urlObj.pathname}`;
      } catch (e) {
        return baseUrl + (qs || "");
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        !isReadyToRender.value ? (openBlock(), createElementBlock("p", _hoisted_1, " Preparing rebate tool... ")) : (openBlock(), createElementBlock("div", _hoisted_2, [
          mode.value === "single" ? (openBlock(), createElementBlock("p", _hoisted_3, " The next section, Your Home’s Details, shows the answers currently being used to determine rebate eligibility. If your details are correct, you can skip this section. To change a setting in the regular interface, expand details if needed, select Edit, then activate a setting and choose a new value. A screen-reader-only Screen reader enhanced interface button is available. After it is enabled, that same button changes to Skip home details and moves focus to the Reset screen reader enhanced interface button. ")) : createCommentVNode("", true),
          mode.value === "archive" ? (openBlock(), createElementBlock("a", _hoisted_4, "Skip to results")) : createCommentVNode("", true),
          isLoading.value ? (openBlock(), createElementBlock("p", _hoisted_5, " Initializing rebates qualifier questionaire from settings... ")) : loadError.value ? (openBlock(), createElementBlock("p", _hoisted_6, " Failed to load rebates: " + toDisplayString(loadError.value), 1)) : (openBlock(), createElementBlock(Fragment, { key: 4 }, [
            mode.value === "single" ? (openBlock(), createElementBlock("dialog", {
              key: 0,
              ref_key: "singleModeDialogRef",
              ref: singleModeDialogRef,
              id: "single-mode-dialog",
              class: "dialog",
              "aria-hidden": isSingleModeDialogOpen.value ? "false" : "true",
              inert: isSingleModeDialogOpen.value ? null : "",
              "aria-modal": "true",
              "aria-live": "polite",
              "aria-labelledby": "single-mode-dialog-title",
              "aria-describedby": "single-mode-dialog-desc",
              onClose: handleSingleModeDialogClosed,
              onClick: handleSingleModeDialogBackdropClick,
              onCancel: withModifiers(closeSingleModeDialog, ["prevent"])
            }, [
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("h2", {
                  id: "single-mode-dialog-title",
                  tabindex: "0",
                  ref_key: "singleModeDialogHeadingRef",
                  ref: singleModeDialogHeadingRef
                }, toDisplayString(singleModeDialogTitle.value), 513),
                createBaseVNode("p", _hoisted_9, toDisplayString(singleModeDialogDescription.value), 1),
                createBaseVNode("div", _hoisted_10, [
                  createBaseVNode("div", _hoisted_11, [
                    createBaseVNode("div", _hoisted_12, [
                      createBaseVNode("div", _hoisted_13, [
                        createBaseVNode("a", {
                          href: "#top",
                          class: "wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button",
                          onClick: _cache[0] || (_cache[0] = withModifiers((...args) => closeSingleModeDialog && closeSingleModeDialog(...args), ["prevent"]))
                        }, "Stay here")
                      ]),
                      singleModeDialogVariant.value === "alternate-rebate" && singleModeAlternateRebate.value ? (openBlock(), createElementBlock("div", _hoisted_14, [
                        createBaseVNode("a", {
                          href: singleModeAlternateRebate.value.href,
                          class: "wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button"
                        }, toDisplayString(singleModeAlternateButtonLabel.value), 9, _hoisted_15)
                      ])) : (openBlock(), createElementBlock("div", _hoisted_16, [..._cache[9] || (_cache[9] = [
                        createBaseVNode("a", {
                          href: "/find-rebates",
                          class: "wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button"
                        }, "Find rebates you might qualify for", -1)
                      ])]))
                    ])
                  ])
                ])
              ]),
              createBaseVNode("button", {
                type: "button",
                class: "close-dialog",
                "aria-label": "Close dialog",
                onClick: closeSingleModeDialog
              }, " Close ")
            ], 40, _hoisted_7)) : createCommentVNode("", true),
            (!hasAllSelection.value || unref(isDirty2)) && mode.value === "single" ? (openBlock(), createElementBlock("div", _hoisted_17, [
              createBaseVNode("p", _hoisted_18, [
                _cache[10] || (_cache[10] = createTextVNode(" We can't recommend a rebate. ", -1)),
                !unref(isDirty2) && !assistiveSimpleMode.value ? (openBlock(), createElementBlock("a", {
                  key: 0,
                  onClick: toggleCollapseView,
                  onKeydown: withKeys(withModifiers(toggleCollapseView, ["prevent"]), ["enter", "space"]),
                  tabindex: "0"
                }, " Please update your home's details. ", 40, _hoisted_19)) : createCommentVNode("", true),
                unref(isDirty2) ? (openBlock(), createElementBlock("span", _hoisted_20, " The page URL does not match your settings. Please update and save your selections. ")) : createCommentVNode("", true)
              ])
            ])) : createCommentVNode("", true),
            mode.value === "single" ? (openBlock(), createElementBlock("button", {
              key: 2,
              type: "button",
              class: "sr-only sr-only-focusable simplify-assistive-toggle",
              onClick: handleAssistiveScreenReaderButton
            }, toDisplayString(assistiveSimpleMode.value ? "Skip home details" : "Screen reader enhanced interface"), 1)) : createCommentVNode("", true),
            createBaseVNode("div", {
              id: "rebatesFilterControls",
              class: normalizeClass(["filter-container", [
                {
                  "filters-dirty": unref(isDirty2),
                  "labels-hidden": !labelsVisible.value
                },
                { collapsed: isCollapseView.value && mode.value === "single" },
                { loading: isLoading.value }
              ]])
            }, [
              mode.value === "single" ? (openBlock(), createElementBlock("article", {
                key: 0,
                class: normalizeClass([
                  "selection-summary",
                  { "assistive-simple-mode": assistiveSimpleMode.value }
                ]),
                role: "region",
                "aria-labelledby": "single-mode-settings-title"
              }, [
                _cache[17] || (_cache[17] = createBaseVNode("h2", {
                  id: "single-mode-settings-title",
                  class: "settings-headline"
                }, " Your home's details ", -1)),
                createBaseVNode("p", _hoisted_21, [
                  assistiveSimpleMode.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    createTextVNode(" Screen reader enhanced interface is active. Settings are shown directly as select fields. Use Tab to move through the fields, or use the reset button to return to the regular interface. ")
                  ], 64)) : isSingleModeEditModeActive.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    createTextVNode(" Edit mode is active. Use Tab to move between settings buttons, then press Enter or Space to edit a setting. ")
                  ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                    createTextVNode(" Read-only summary of your current home details. Use Tab to move through controls. ")
                  ], 64))
                ]),
                createBaseVNode("p", _hoisted_22, toDisplayString(singleModeSettingsContextMessage.value), 1),
                !assistiveSimpleMode.value ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  ref_key: "collapseButtonRef",
                  ref: collapseButtonRef,
                  class: normalizeClass(["rebate-collapse-setting", isCollapseView.value ? "collapsed" : ""]),
                  tabindex: "0",
                  "aria-expanded": isCollapseView.value ? "false" : "true",
                  "aria-controls": "single-mode-controls",
                  "aria-labelledby": "single-mode-settings-title single-mode-settings-details-label",
                  onClick: toggleCollapseView
                }, [
                  createBaseVNode("span", _hoisted_24, toDisplayString(isCollapseView.value ? "Expand details" : "Collapse details"), 1)
                ], 10, _hoisted_23)) : createCommentVNode("", true),
                createCommentVNode("", true),
                createBaseVNode("div", {
                  id: "single-mode-controls",
                  class: "control-container",
                  inert: isCollapseView.value ? "" : null,
                  "aria-hidden": isCollapseView.value ? "true" : "false"
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(fields.value, (field) => {
                    return openBlock(), createElementBlock(Fragment, {
                      key: field.key
                    }, [
                      field.condition === void 0 || field.condition ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                        field.displayValue && isSingleModeEditModeActive.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                          activeEdit.value !== field.key ? (openBlock(), createElementBlock("div", _hoisted_27, [
                            createBaseVNode("label", _hoisted_28, toDisplayString(field.shortDesc), 1),
                            createBaseVNode("button", {
                              class: normalizeClass(["rebate-setting", {
                                "is-external-dirty": isExternalDirty.value && lastChangedField.value === field.key,
                                error: fieldErrors.value[field.key]
                              }]),
                              disabled: field.disabled,
                              tabindex: "0",
                              "data-field-key": field.key,
                              "aria-label": getEditFieldButtonLabel(
                                field
                              ),
                              "aria-describedby": [
                                `${field.key}-edit-hint`,
                                fieldErrors.value[field.key] ? `${field.key}-edit-warning` : null
                              ].filter(Boolean).join(" "),
                              onClick: ($event) => openEdit(field.key, $event),
                              ref_for: true,
                              ref: (el) => buttonRefs.value[field.key] = el
                            }, toDisplayString(field.displayValue), 11, _hoisted_29),
                            createBaseVNode("span", {
                              id: `${field.key}-edit-hint`,
                              class: "sr-only"
                            }, "Activate to edit " + toDisplayString(field.shortDesc) + ".", 9, _hoisted_30),
                            fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", {
                              key: 0,
                              id: `${field.key}-edit-warning`,
                              class: "rebate-setting-warning"
                            }, [
                              createCommentVNode("", true),
                              (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                                createTextVNode(" This page is based on " + toDisplayString(field.key === "building" ? "home and heating type" : "current heating type") + ". To see rebates for a different home type, ", 1),
                                _cache[15] || (_cache[15] = createBaseVNode("a", {
                                  href: "/find-rebates/",
                                  style: { "color": "darkred", "text-underline-offset": "2px" }
                                }, "go back to the questionnaire.", -1))
                              ], 64))
                            ], 8, _hoisted_31)) : createCommentVNode("", true)
                          ])) : editable.value && activeEdit.value === field.key ? (openBlock(), createElementBlock("div", _hoisted_32, [
                            createBaseVNode("figure", _hoisted_33, [
                              !assistiveSimpleMode.value ? (openBlock(), createElementBlock("button", {
                                key: 0,
                                disabled: !field.model.value,
                                type: "button",
                                class: "close-btn",
                                tabindex: "-1",
                                "aria-hidden": "true",
                                onClick: ($event) => closeEdit(field.key),
                                "aria-label": `Close ${field.shortDesc} editor`
                              }, null, 8, _hoisted_34)) : createCommentVNode("", true),
                              createBaseVNode("label", {
                                id: `${field.key}SelectLabel`,
                                for: `${field.key}Select`
                              }, toDisplayString(field.label), 9, _hoisted_35),
                              withDirectives((openBlock(), createElementBlock("select", {
                                key: field.key + "-" + (fieldRenderKeys.value[field.key] ?? 0),
                                class: normalizeClass([
                                  "select",
                                  fieldErrors.value[field.key] ? "error" : ""
                                ]),
                                id: `${field.key}Select`,
                                "aria-describedby": [
                                  field.description ? `${field.key}SelectDesc` : null,
                                  fieldErrors.value[field.key] && field.error_desc ? `${field.key}SelectError` : null
                                ].filter(Boolean).join(" ") || null,
                                "onUpdate:modelValue": ($event) => field.model.value = $event,
                                disabled: field.disabled,
                                onChange: ($event) => handleSelectChange(
                                  field.key,
                                  $event.target.value
                                ),
                                onKeydown: ($event) => handleSelectKeydown(
                                  $event,
                                  field.key,
                                  field.model.value
                                ),
                                ref_for: true,
                                ref: (el) => selectRefs.value[field.key] = el
                              }, [
                                createBaseVNode("option", {
                                  disabled: "",
                                  selected: !field.model.value,
                                  "data-default": "Select an option",
                                  value: ""
                                }, " Select an option ", 8, _hoisted_37),
                                field.isGrouped ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(field.groups, (group) => {
                                  return openBlock(), createElementBlock("optgroup", {
                                    key: group.slug,
                                    label: group.name === "MURB" ? "Multi-unit residential buildings" : group.name
                                  }, [
                                    (openBlock(true), createElementBlock(Fragment, null, renderList(group.children, (child) => {
                                      return openBlock(), createElementBlock("option", {
                                        key: child.slug,
                                        value: child.slug
                                      }, toDisplayString(child.name), 9, _hoisted_39);
                                    }), 128))
                                  ], 8, _hoisted_38);
                                }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(field.options, (opt) => {
                                  return openBlock(), createElementBlock("option", {
                                    key: opt.slug,
                                    value: opt.slug
                                  }, toDisplayString(opt.name), 9, _hoisted_40);
                                }), 128))
                              ], 42, _hoisted_36)), [
                                [vModelSelect, field.model.value]
                              ]),
                              field.description ? (openBlock(), createElementBlock("figcaption", {
                                key: 1,
                                id: `${field.key}SelectDesc`
                              }, toDisplayString(field.description), 9, _hoisted_41)) : createCommentVNode("", true),
                              getFieldErrorDescription(
                                field
                              ) && fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", {
                                key: 2,
                                id: `${field.key}SelectError`,
                                class: "message error-message",
                                "aria-live": "polite",
                                innerHTML: getFieldErrorDescription(
                                  field
                                )
                              }, null, 8, _hoisted_42)) : createCommentVNode("", true),
                              field.key === "heating" && field.disabled ? (openBlock(), createElementBlock("figcaption", _hoisted_43, " This heating type is preselected for this rebate. ")) : createCommentVNode("", true)
                            ])
                          ])) : createCommentVNode("", true)
                        ], 64)) : field.displayValue && !isSingleModeEditModeActive.value && !assistiveSimpleMode.value ? (openBlock(), createElementBlock("div", {
                          key: 1,
                          class: "control label-group",
                          role: "group",
                          "aria-labelledby": `${field.key}-summary-label ${field.key}-summary-value`
                        }, [
                          createBaseVNode("label", {
                            class: "small",
                            id: `${field.key}-summary-label`
                          }, toDisplayString(field.shortDesc), 9, _hoisted_45),
                          createBaseVNode("p", {
                            class: normalizeClass([
                              "rebate-detail",
                              fieldErrors.value[field.key] ? "error" : ""
                            ]),
                            id: `${field.key}-summary-value`
                          }, toDisplayString(field.displayValue), 11, _hoisted_46),
                          fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", _hoisted_47, " This setting is not supported for this rebate. ")) : createCommentVNode("", true)
                        ], 8, _hoisted_44)) : (openBlock(), createElementBlock("figure", _hoisted_48, [
                          !assistiveSimpleMode.value ? (openBlock(), createElementBlock("button", {
                            key: 0,
                            disabled: !field.model.value,
                            type: "button",
                            class: "close-btn",
                            tabindex: "-1",
                            "aria-hidden": "true",
                            onClick: ($event) => closeEdit(field.key),
                            "aria-label": `Close ${field.shortDesc} editor`
                          }, null, 8, _hoisted_49)) : createCommentVNode("", true),
                          createBaseVNode("label", {
                            id: `${field.key}SelectLabel`,
                            for: `${field.key}Select`
                          }, toDisplayString(field.label), 9, _hoisted_50),
                          withDirectives((openBlock(), createElementBlock("select", {
                            key: field.key + "-" + (fieldRenderKeys.value[field.key] ?? 0),
                            class: normalizeClass([
                              "select",
                              fieldErrors.value[field.key] ? "error" : ""
                            ]),
                            id: `${field.key}Select`,
                            "aria-describedby": [
                              field.description ? `${field.key}SelectDesc` : null,
                              fieldErrors.value[field.key] && field.error_desc ? `${field.key}SelectError` : null
                            ].filter(Boolean).join(" ") || null,
                            "onUpdate:modelValue": ($event) => field.model.value = $event,
                            disabled: field.disabled,
                            onChange: ($event) => handleSelectChange(
                              field.key,
                              $event.target.value
                            ),
                            onKeydown: ($event) => handleSelectKeydown(
                              $event,
                              field.key,
                              field.model.value
                            ),
                            ref_for: true,
                            ref: (el) => selectRefs.value[field.key] = el
                          }, [
                            createBaseVNode("option", {
                              disabled: "",
                              selected: !field.model.value,
                              "data-default": "Select an option",
                              value: ""
                            }, " Select an option ", 8, _hoisted_52),
                            field.isGrouped ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(field.groups, (group) => {
                              return openBlock(), createElementBlock("optgroup", {
                                key: group.slug,
                                label: group.name === "MURB" ? "Multi-unit residential buildings" : group.name
                              }, [
                                (openBlock(true), createElementBlock(Fragment, null, renderList(group.children, (child) => {
                                  return openBlock(), createElementBlock("option", {
                                    key: child.slug,
                                    value: child.slug
                                  }, toDisplayString(child.name), 9, _hoisted_54);
                                }), 128))
                              ], 8, _hoisted_53);
                            }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(field.options, (opt) => {
                              return openBlock(), createElementBlock("option", {
                                key: opt.slug,
                                value: opt.slug
                              }, toDisplayString(opt.name), 9, _hoisted_55);
                            }), 128))
                          ], 42, _hoisted_51)), [
                            [vModelSelect, field.model.value]
                          ]),
                          field.description ? (openBlock(), createElementBlock("figcaption", {
                            key: 1,
                            id: `${field.key}SelectDesc`
                          }, toDisplayString(field.description), 9, _hoisted_56)) : createCommentVNode("", true),
                          getFieldErrorDescription(
                            field
                          ) && fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", {
                            key: 2,
                            id: `${field.key}SelectError`,
                            class: "message error-message",
                            "aria-live": "polite",
                            innerHTML: getFieldErrorDescription(
                              field
                            )
                          }, null, 8, _hoisted_57)) : createCommentVNode("", true)
                        ]))
                      ], 64)) : createCommentVNode("", true)
                    ], 64);
                  }), 128)),
                  createBaseVNode("div", _hoisted_58, [
                    createBaseVNode("div", null, [
                      isSingleModeEditModeActive.value ? (openBlock(), createElementBlock("label", _hoisted_59, "Settings instructions")) : createCommentVNode("", true),
                      isSingleModeEditModeActive.value ? (openBlock(), createElementBlock("p", _hoisted_60, " Updating your home's details will refresh the page content. ")) : createCommentVNode("", true)
                    ]),
                    !assistiveSimpleMode.value ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: normalizeClass([
                        "editBtn toggle-edit-mode readonly-toggle",
                        isSavingEditMode.value ? "saving" : isSingleModeEditModeActive.value ? "show-edit-mode" : "show-readonly-mode"
                      ]),
                      tabindex: "0",
                      disabled: isSingleModeEditToggleDisabled.value,
                      "aria-describedby": "single-mode-summary-instructions",
                      onClick: toggleEditModeView,
                      "aria-label": editModeToggleLabel.value,
                      title: editModeToggleLabel.value
                    }, [
                      createBaseVNode("span", null, toDisplayString(isSavingEditMode.value ? "Saving edit..." : isSingleModeEditModeActive.value ? "Edit" : "Edit"), 1)
                    ], 10, _hoisted_61)) : createCommentVNode("", true),
                    assistiveSimpleMode.value ? (openBlock(), createElementBlock("button", {
                      key: 1,
                      ref_key: "resetSimplifiedButtonRef",
                      ref: resetSimplifiedButtonRef,
                      type: "button",
                      class: "reset-simplified-interface-btn",
                      tabindex: "0",
                      "aria-label": "Collapse your home's details and reset the screen reader enhanced interface",
                      onClick: disableAssistiveSimpleMode
                    }, [..._cache[16] || (_cache[16] = [
                      createBaseVNode("span", null, "Reset screen reader enhanced interface", -1)
                    ])], 512)) : createCommentVNode("", true),
                    createCommentVNode("", true)
                  ])
                ], 8, _hoisted_26)
              ], 2)) : createCommentVNode("", true),
              mode.value === "archive" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                createCommentVNode("", true),
                createBaseVNode("div", _hoisted_64, toDisplayString(ariaStatusMessage.value), 1),
                createBaseVNode("div", _hoisted_65, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(fields.value, (field) => {
                    return openBlock(), createElementBlock(Fragment, {
                      key: field.key
                    }, [
                      field.condition === void 0 || field.condition ? (openBlock(), createElementBlock("div", _hoisted_66, [
                        _cache[19] || (_cache[19] = createBaseVNode("div", { class: "num-label" }, null, -1)),
                        createBaseVNode("figure", _hoisted_67, [
                          createBaseVNode("label", {
                            for: `${field.key}Select`
                          }, [
                            createTextVNode(toDisplayString(field.label) + " ", 1),
                            field.definition ? (openBlock(), createElementBlock("a", {
                              key: 0,
                              href: field.glossary_link,
                              class: normalizeClass({
                                wide: field.glossary_wide
                              })
                            }, toDisplayString(field.definition), 11, _hoisted_69)) : createCommentVNode("", true)
                          ], 8, _hoisted_68),
                          field.key === "location" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                            createBaseVNode("div", _hoisted_70, [
                              withDirectives(createBaseVNode("input", {
                                list: isMobile.value ? `${field.key}ListMobile` : `${field.key}List`,
                                id: `${field.key}Select`,
                                type: "text",
                                autocomplete: "off",
                                class: normalizeClass(["location-input", {
                                  "is-empty": !locationInputValue.value,
                                  "is-valid": !isLocationFocused.value && isLocationValid.value,
                                  "is-error": !isLocationFocused.value && !isLocationValid.value && locationInputValue.value,
                                  "is-invalid": isLocationFocused.value && !isLocationValid.value && locationInputValue.value,
                                  "has-valid-selection": hasValidArchiveLocationSelection.value
                                }]),
                                "aria-invalid": locationInputValue.value && !isLocationValid.value ? "true" : "false",
                                "aria-describedby": fieldErrors.value[field.key] ? `${field.key}Error` : null,
                                placeholder: "Your community...",
                                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => locationInputProxy.value = $event),
                                disabled: field.disabled,
                                onFocus: handleFocus,
                                onBlur: _cache[2] || (_cache[2] = ($event) => unref(handleLocationInputCommit)(
                                  "blur"
                                )),
                                onChange: _cache[3] || (_cache[3] = ($event) => unref(handleLocationInputCommit)(
                                  "change"
                                )),
                                onKeydown: _cache[4] || (_cache[4] = withKeys(withModifiers(($event) => unref(handleLocationInputCommit)(
                                  "enter"
                                ), ["prevent"]), ["enter"]))
                              }, null, 42, _hoisted_71), [
                                [
                                  vModelText,
                                  locationInputProxy.value
                                ]
                              ]),
                              hasValidArchiveLocationSelection.value ? (openBlock(), createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "location-clear-btn",
                                "aria-label": "Clear selected community",
                                onMousedown: _cache[5] || (_cache[5] = withModifiers(() => {
                                }, ["prevent"])),
                                onClick: _cache[6] || (_cache[6] = withModifiers((...args) => clearArchiveLocationSelection && clearArchiveLocationSelection(...args), ["prevent"]))
                              }, null, 32)) : createCommentVNode("", true)
                            ]),
                            !isMobile.value ? (openBlock(), createElementBlock("datalist", {
                              key: 0,
                              id: `${field.key}List`
                            }, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(locationOptionsForInput.value, (opt) => {
                                return openBlock(), createElementBlock("option", {
                                  key: opt.slug,
                                  value: opt.name
                                }, null, 8, _hoisted_73);
                              }), 128))
                            ], 8, _hoisted_72)) : (openBlock(), createElementBlock("datalist", {
                              key: 1,
                              id: `${field.key}ListMobile`
                            }, [
                              locationQueryIsEmpty.value ? (openBlock(), createElementBlock("option", _hoisted_75)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(mobileLocationOptions.value, (opt) => {
                                return openBlock(), createElementBlock("option", {
                                  key: opt.slug,
                                  value: opt.name
                                }, null, 8, _hoisted_76);
                              }), 128))
                            ], 8, _hoisted_74)),
                            field.error_desc && fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", {
                              key: 2,
                              class: "message error-message",
                              innerHTML: field.error_desc,
                              "aria-live": "polite"
                            }, null, 8, _hoisted_77)) : createCommentVNode("", true),
                            field.description ? (openBlock(), createElementBlock("figcaption", _hoisted_78, toDisplayString(field.description), 1)) : createCommentVNode("", true),
                            field.filter_desc && !field.disabled ? (openBlock(), createElementBlock("figcaption", _hoisted_79, toDisplayString(field.filter_desc), 1)) : createCommentVNode("", true),
                            field.disabled_desc && field.disabled ? (openBlock(), createElementBlock("figcaption", _hoisted_80, toDisplayString(field.disabled_desc), 1)) : createCommentVNode("", true)
                          ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                            withDirectives((openBlock(), createElementBlock("select", {
                              key: field.key + "-" + (fieldRenderKeys.value[field.key] ?? 0),
                              class: normalizeClass([
                                "select",
                                fieldErrors.value[field.key] ? "error" : ""
                              ]),
                              id: `${field.key}Select`,
                              "onUpdate:modelValue": ($event) => field.model.value = $event,
                              disabled: field.disabled,
                              onChange: ($event) => handleSelectChange(
                                field.key,
                                $event.target.value
                              ),
                              onKeydown: ($event) => handleSelectKeydown(
                                $event,
                                field.key,
                                field.model.value
                              ),
                              ref_for: true,
                              ref: (el) => selectRefs.value[field.key] = el
                            }, [
                              createBaseVNode("option", {
                                disabled: "",
                                selected: !field.model.value,
                                "data-default": "Select an option",
                                value: ""
                              }, " Select an option ", 8, _hoisted_82),
                              field.isGrouped ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(field.groups, (group) => {
                                return openBlock(), createElementBlock(Fragment, {
                                  key: group.slug
                                }, [
                                  group.slug !== "other" ? (openBlock(), createElementBlock("optgroup", {
                                    key: 0,
                                    label: group.name === "MURB" ? "Multi-unit residential buildings" : group.name
                                  }, [
                                    (openBlock(true), createElementBlock(Fragment, null, renderList(group.children, (child) => {
                                      return openBlock(), createElementBlock("option", {
                                        key: child.slug,
                                        value: child.slug
                                      }, toDisplayString(child.name), 9, _hoisted_84);
                                    }), 128))
                                  ], 8, _hoisted_83)) : (openBlock(), createElementBlock("option", {
                                    key: group.slug,
                                    value: group.slug
                                  }, toDisplayString(group.name), 9, _hoisted_85))
                                ], 64);
                              }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(field.options, (opt) => {
                                return openBlock(), createElementBlock("option", {
                                  key: opt.slug,
                                  value: opt.slug
                                }, toDisplayString(opt.name), 9, _hoisted_86);
                              }), 128))
                            ], 42, _hoisted_81)), [
                              [vModelSelect, field.model.value]
                            ]),
                            field.description ? (openBlock(), createElementBlock("figcaption", _hoisted_87, toDisplayString(field.description), 1)) : createCommentVNode("", true),
                            field.filter_desc && !field.disabled ? (openBlock(), createElementBlock("figcaption", _hoisted_88, toDisplayString(field.filter_desc), 1)) : createCommentVNode("", true),
                            field.disabled_desc && field.disabled ? (openBlock(), createElementBlock("figcaption", _hoisted_89, toDisplayString(field.disabled_desc), 1)) : createCommentVNode("", true),
                            field.error_desc && fieldErrors.value[field.key] ? (openBlock(), createElementBlock("p", {
                              key: 3,
                              class: "message error-message",
                              "aria-live": "polite",
                              innerHTML: field.error_desc
                            }, null, 8, _hoisted_90)) : createCommentVNode("", true),
                            field.key === "building" ? (openBlock(), createElementBlock("div", _hoisted_91)) : createCommentVNode("", true)
                          ], 64))
                        ])
                      ])) : createCommentVNode("", true)
                    ], 64);
                  }), 128))
                ]),
                hasAnySelection.value ? (openBlock(), createElementBlock("div", _hoisted_92, [
                  createBaseVNode("a", {
                    href: "#clear",
                    onClick: withModifiers(clearSettings, ["prevent"])
                  }, "Clear settings"),
                  _cache[20] || (_cache[20] = createTextVNode(" to start over ", -1))
                ])) : (openBlock(), createElementBlock("div", _hoisted_93, " Please answer the form questions to see possible rebates. "))
              ], 64)) : createCommentVNode("", true)
            ], 2),
            mode.value === "archive" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
              hasAllSelection.value && filteredResults.value.length ? (openBlock(), createElementBlock("section", _hoisted_94, [
                createBaseVNode("div", _hoisted_95, [
                  _cache[21] || (_cache[21] = createBaseVNode("div", null, [
                    createBaseVNode("h2", null, "Congratulations!"),
                    createBaseVNode("p", null, " You might be eligible for these rebate offers: ")
                  ], -1)),
                  createBaseVNode("div", _hoisted_96, [
                    withDirectives(createBaseVNode("input", {
                      id: "grid-or-list",
                      type: "checkbox",
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => displayGridOrList.value = $event),
                      class: "sr-only",
                      "aria-label": displayGridOrList.value ? "Switch to list view" : "Switch to grid view",
                      onChange: onViewToggleChange,
                      onKeydown: _cache[8] || (_cache[8] = withKeys(withModifiers((...args) => toggleViewWithKeyboard && toggleViewWithKeyboard(...args), ["prevent"]), ["enter"]))
                    }, null, 40, _hoisted_97), [
                      [vModelCheckbox, displayGridOrList.value]
                    ]),
                    createBaseVNode("label", _hoisted_98, [
                      createBaseVNode("span", _hoisted_99, toDisplayString(displayGridOrList.value ? "Switch to list view" : "Switch to grid view"), 1)
                    ])
                  ])
                ]),
                createBaseVNode("div", {
                  class: normalizeClass([
                    "results",
                    displayGridOrList.value ? "grid-view" : "list-view"
                  ])
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(filteredResults.value, (item, index) => {
                    return openBlock(), createElementBlock(Fragment, {
                      key: item.id
                    }, [
                      createBaseVNode("article", {
                        class: normalizeClass(["rebate-card", item.rebate_type_class])
                      }, [
                        createBaseVNode("a", {
                          href: withQueryString(
                            item.post_url ?? item.url ?? "#"
                          ),
                          style: { "position": "relative" },
                          "aria-label": item.rebate_type_headline_card
                        }, [
                          createBaseVNode("div", _hoisted_101, [
                            createCommentVNode("", true),
                            item.rebate_featured_image ? (openBlock(), createElementBlock("figure", _hoisted_103, [
                              createBaseVNode("img", {
                                decoding: "async",
                                width: "1024",
                                height: "515",
                                "data-print-width": "25",
                                src: item.rebate_featured_image,
                                alt: "",
                                title: ""
                              }, null, 8, _hoisted_104)
                            ])) : createCommentVNode("", true),
                            createCommentVNode("", true)
                          ]),
                          createBaseVNode("div", _hoisted_107, [
                            createBaseVNode("header", null, [
                              createBaseVNode("h3", _hoisted_108, [
                                createBaseVNode("div", null, toDisplayString(item.rebate_type_headline_card), 1),
                                !item.rebate_type_headline_card.includes(
                                  "Insulation"
                                ) && !item.rebate_type_headline_card.includes(
                                  "Window"
                                ) ? (openBlock(), createElementBlock("small", _hoisted_109, toDisplayString(item.title), 1)) : createCommentVNode("", true)
                              ])
                            ]),
                            createBaseVNode("div", _hoisted_110, [
                              item.rebate_value_card ? (openBlock(), createElementBlock("div", _hoisted_111, [
                                createBaseVNode("div", null, toDisplayString(item.rebate_value_card), 1)
                              ])) : createCommentVNode("", true),
                              item.rebate_description_card ? (openBlock(), createElementBlock("div", _hoisted_112, [
                                createBaseVNode("div", null, toDisplayString(item.rebate_description_card), 1)
                              ])) : createCommentVNode("", true)
                            ])
                          ])
                        ], 8, _hoisted_100)
                      ], 2),
                      createCommentVNode("", true)
                    ], 64);
                  }), 128))
                ], 2),
                !filteredResults.value.length ? (openBlock(), createElementBlock("p", _hoisted_114, " No rebates match your current selections (" + toDisplayString(espTier.value) + "). ", 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              hasAllSelection.value && !filteredResults.value.length ? (openBlock(), createElementBlock("section", _hoisted_115, [..._cache[23] || (_cache[23] = [
                createBaseVNode("div", { class: "not-eligible-insertion" }, null, -1)
              ])])) : createCommentVNode("", true),
              !hasAllSelection.value ? (openBlock(), createElementBlock("p", _hoisted_116, " Please complete the questionnaire form to see your rebate options. ")) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            createCommentVNode("", true)
          ], 64))
        ]))
      ]);
    };
  }
};
const vNextRebateFilterApp = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0e23dfd3"]]);
function initVueApp(component, selector, props = {}) {
  const element = document.querySelector(selector);
  if (element) {
    const app = createApp(component, props);
    app.mount(element);
  }
}
function initializeApps() {
  const apps = [
    {
      component: PQEAFilterApp,
      selector: "#pqeaFilterApp",
      props: { appProp: "PQEA Data" }
    },
    {
      component: ContractorFilterApp,
      selector: "#contractorFilterApp",
      props: { appProp: "Contractor Data" }
    },
    {
      component: vNextRebateFilterApp,
      selector: "#vnextRebateFilterApp",
      props: { appProp: "Rebate Data" }
    }
  ];
  apps.forEach(({ component, selector, props }) => {
    const element = document.querySelector(selector);
    if (element) {
      initVueApp(component, selector, props);
    }
  });
}
function addSafeEventListener(el, event, handler, options) {
  if (el && typeof el.addEventListener === "function") {
    el.addEventListener(event, handler, options);
  } else {
    console.warn(
      "Invalid EventTarget or unsupported method: addEventListener"
    );
  }
}
if (document.readyState === "complete") {
  initializeApps();
} else {
  addSafeEventListener(document, "DOMContentLoaded", initializeApps);
}
