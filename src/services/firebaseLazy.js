// Firebase is about 477 KB of JavaScript, and it used to arrive on every first
// paint of medxplore.net. Nothing on the public landing path needs it: Home.jsx
// reads no Firestore and no auth. It was in the initial chunk graph only
// because the three context providers that wrap the whole app imported it at
// module scope, so Rollup had to resolve it before anything could render.
//
// Every route that genuinely needs Firebase is already behind React.lazy, so
// these accessors keep the import dynamic. The firebase chunk is fetched the
// first time something actually reads or writes, and a visitor who only looks
// at the homepage never downloads it at all.
//
// Each promise is memoised, so repeated calls share one module instance and
// Firebase is still initialised exactly once.

let firebasePromise;
/** The initialised app: `{ auth, db, storage }` from ./firebase. */
export const loadFirebase = () => (firebasePromise ??= import('./firebase'));

let firestorePromise;
/** The `firebase/firestore` SDK surface (collection, onSnapshot, getDocs...). */
export const loadFirestore = () => (firestorePromise ??= import('firebase/firestore'));

let authPromise;
/** The `firebase/auth` SDK surface (signInWithEmailAndPassword...). */
export const loadFirebaseAuth = () => (authPromise ??= import('firebase/auth'));

let databasePromise;
/** This app's own Firestore query layer in ./database. */
export const loadDatabase = () => (databasePromise ??= import('./database'));
