import auth from './auth';
import changelog from './changelog';
import chat from './chat';
import clerk from './clerk';
import color from './color';
import common from './common';
import components from './components';
import discover from './discover';
import electron from './electron';
import error from './error';
import file from './file';
import hotkey from './hotkey';
import knowledgeBase from './knowledgeBase';
import metadata from './metadata';
import migration from './migration';
import modelProvider from './modelProvider';
import models from './models';
import oauth from './oauth';
import plugin from './plugin';
import portal from './portal';
import providers from './providers';
import ragEval from './ragEval';
import setting from './setting';
import thread from './thread';
import tool from './tool';
import topic from './topic';
import welcome from './welcome';
import workflow from './workflow';

const resources = {
  auth,
  changelog,
  chat,
  clerk,
  color,
  common,
  components,
  discover,
  electron,
  error,
  file,
  hotkey,
  knowledgeBase,
  metadata,
  migration,
  modelProvider,
  models,
  oauth,
  plugin,
  portal,
  providers,
  ragEval,
  setting,
  thread,
  tool,
  topic,
  welcome,
  workflow,
} as const;

export default resources;
