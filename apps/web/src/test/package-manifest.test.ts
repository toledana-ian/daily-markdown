import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(currentDir, '../../package.json');

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe('@daily-markdown/web package manifest', () => {
  it('declares codemirror packages imported by the note editor dialog', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageManifest;
    const declaredPackages = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ]);

    expect(Array.from(declaredPackages)).toEqual(
      expect.arrayContaining([
        '@codemirror/lang-markdown',
        '@codemirror/language-data',
        '@codemirror/view',
      ]),
    );
  });

  it('declares the rehype plugin used for GitHub-style markdown alerts', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageManifest;
    const declaredPackages = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ]);

    expect(declaredPackages).toContain('rehype-github-alerts');
  });
});
