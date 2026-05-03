import { Buffer } from 'buffer';
import process from 'process';
import util from 'util';

if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
  (window as any).process = {
    ...window.process,
    ...process,
    env: { ...(window.process?.env || {}), ...(process.env || {}) },
    browser: true,
    version: 'v16.0.0',
    nextTick: (fn: any) => setTimeout(fn, 0),
  } as any;
  (window as any).util = util;
}
