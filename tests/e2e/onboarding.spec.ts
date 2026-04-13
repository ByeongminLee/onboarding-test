import { test, expect, _electron as electron, type ElectronApplication } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ELECTRON_MAIN = path.join(__dirname, '../../out/main/index.js');

async function launch(userDataDir?: string): Promise<ElectronApplication> {
  const args = [ELECTRON_MAIN];
  if (userDataDir) args.push(`--user-data-dir=${userDataDir}`);
  return electron.launch({ args });
}

test('sidebar shows parts and docs, clicking a doc navigates', async () => {
  const app = await launch();
  const win = await app.firstWindow();

  await expect(win.getByText('계정 체크')).toBeVisible();
  await expect(win.getByText('환경 세팅')).toBeVisible();

  await win.getByRole('button', { name: /Docker 설치/ }).click();
  await expect(win.getByRole('heading', { name: /Docker 설치/, level: 1 })).toBeVisible();

  await app.close();
});

test('completing a doc persists across app restart', async ({}, testInfo) => {
  const userDir = testInfo.outputPath('user-data');

  // First launch: mark complete
  {
    const app = await launch(userDir);
    const win = await app.firstWindow();
    await win.getByRole('button', { name: /GitHub 초대 확인/ }).click();
    await win.getByRole('button', { name: /완료로 표시/ }).click();
    await expect(win.getByRole('button', { name: /완료됨/ })).toBeVisible();
    await app.close();
  }

  // Second launch: completion should persist
  {
    const app = await launch(userDir);
    const win = await app.firstWindow();
    await win.getByRole('button', { name: /GitHub 초대 확인/ }).click();
    await expect(win.getByRole('button', { name: /완료됨/ })).toBeVisible();
    await app.close();
  }
});
