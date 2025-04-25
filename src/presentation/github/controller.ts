import { Request, Response } from "express";
import { GitHubService } from "../services/github.service";
import { DiscordService } from "../services/discord.service";


export class GithubController {

  constructor(
    private readonly githubService = new GitHubService(),
    private readonly discordService = new DiscordService()
  ) {}

  webhookHandler = (request: Request, response: Response) => {

    const githubEvent = request.header('x-github-event') ?? 'unknown'    
    const payload = request.body
    let message: string

    switch (githubEvent) {
      case 'star':
        message = this.githubService.onStar(payload)        
        break;

      case 'issues':
        message = this.githubService.onIssue(payload)        
        break;
    
      default:
        message = `Unknown event ${githubEvent}`
        break;
    }

    this.discordService.notify(message)
      .then(() => response.status(202).send('Accepted'))
      .catch(() => response.status(400).json({error: 'Internal server error'}))

  }
}