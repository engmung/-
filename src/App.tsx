/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chat } from './components/Chat';

export default function App() {
  return (
    <div className="h-screen w-full bg-slate-50 font-sans text-slate-900 flex justify-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col relative border-x border-slate-200">
        <Chat />
      </div>
    </div>
  );
}
