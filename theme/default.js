import 'normalize.css/normalize.css';
import 'codemirror/lib/codemirror.css';
import 'vj-simplemde/src/css/simplemde.css';
import 'pickadate/lib/themes/classic.css';
import 'pickadate/lib/themes/classic.date.css';
import 'pickadate/lib/themes/classic.time.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/pascal/pascal';
import 'codemirror/mode/python/python';
import 'codemirror/mode/php/php';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/mode/ruby/ruby';
import 'katex/dist/katex.min.css';

import 'vj/misc/float.styl';
import 'vj/misc/typography.styl';
import 'vj/misc/textalign.styl';
import 'vj/misc/grid.styl';
import 'vj/misc/slideout.styl';

import 'vj/misc/.iconfont/webicon.styl';
import 'vj/misc/immersive.styl';
import 'vj/misc/structure.styl';
import 'vj/misc/section.styl';
import 'vj/misc/nothing.styl';

import 'vj/components/cmeditor/cmeditor.styl';
import 'vj/components/datepicker/datepicker.styl';
import 'vj/components/katex/katex.styl';

// load all page stylesheets
const pageStyleReq = require.context('../', true, /\.page\.styl$/i);
pageStyleReq.keys().map((key) => pageStyleReq(key).default);
