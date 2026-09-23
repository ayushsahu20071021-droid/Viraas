import {spawnSync} from 'node:child_process'
const result=spawnSync(process.execPath,['--import','tsx','scripts/audit-affiliate.ts'],{stdio:'inherit'})
process.exitCode=result.status??1
