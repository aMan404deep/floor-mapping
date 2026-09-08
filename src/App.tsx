/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Editor } from './components/Editor';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="bottom-center" theme="dark" />
      <Editor />
    </>
  );
}
