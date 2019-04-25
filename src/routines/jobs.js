const Routine = require('../structures/Routine');

class JobsRoutine extends Routine {
  constructor(client) {
    super(client);
  }

  async handle() {
    const jobs = await this.client.database.getDocuments('jobs', true)
      .then(jobs => jobs.filter(job => job.end - Date.now() < 0));
  
    for (const job of jobs) {
      if (job.type === 'poll') {
        if (this.client.other.getShardID(job.guild) != this.client.shard.id) return;
        this.client.handler.poll(job);
        this.client.database.deleteDocument('jobs', job.id);
      } else if (job.type === 'remind') {
        if (this.client.shard.id !== 0) return;
        this.client.handler.remind(job);
        this.client.database.deleteDocument('jobs', job.id);
      }
    }
  }
}

module.exports = JobsRoutine;
