'use client';
const DEVPATH_API =
  process.env.NEXT_PUBLIC_DEVPATH_API_URL ?? 'https://api.devpath.in';
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/ui-store';

// Code snippets that type across the screen — dev/community themed
const CODE_LINES = [
  // Git
  'git commit -m "built something great"',
  'git push origin main',
  'git checkout -b feature/new-idea',
  'git merge --no-ff dev',
  'git rebase -i HEAD~3',
  'git stash pop',
  'git log --oneline --graph',
  'git pull upstream main',

  // JavaScript / TypeScript
  'const dev = new DevPath();',
  'import { ambition } from "devpath";',
  'export default BetterDeveloper;',
  'type Developer = Community & Code;',
  'const skills = [...learning, ...building];',
  'await openSource.push(yourIdea);',
  'if (curious) { keep.going(); }',
  'while (alive) { learn(); }',
  'console.log("you belong here");',
  'Promise.all([effort, peers]).then(grow);',
  .catch(err => console.error(err))