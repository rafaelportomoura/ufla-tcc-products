import { STATUS_MAP } from '../constants/status';

export type Status = (typeof STATUS_MAP)[keyof typeof STATUS_MAP];
