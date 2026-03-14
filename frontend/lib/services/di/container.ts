import { SupabaseStudyRequestRepository } from "../infrastructure/repositories/SupabaseStudyRequestRepository"
import { SupabaseApplicationRepository } from "../infrastructure/repositories/SupabaseApplicationRepository"
import { SupabaseStudyResourceRepository } from "../infrastructure/repositories/SupabaseStudyResourceRepository"
import { SupabaseMessageRepository } from "../infrastructure/repositories/SupabaseMessageRepository"
import { SupabaseConversationRepository } from "../infrastructure/repositories/SupabaseConversationRepository"
import { SupabaseEventRepository } from "../infrastructure/repositories/SupabaseEventRepository"
import { SupabaseStudyGroupRepository } from "../infrastructure/repositories/SupabaseStudyGroupRepository"

import { GetFeedRequests } from "../domain/use-cases/study-requests/GetFeedRequests"
import { CreateStudyRequest } from "../domain/use-cases/study-requests/CreateStudyRequest"
import { UpdateStudyRequest } from "../domain/use-cases/study-requests/UpdateStudyRequest"
import { ApplyToStudyRequest } from "../domain/use-cases/applications/ApplyToStudyRequest"
import { ReviewApplication } from "../domain/use-cases/applications/ReviewApplication"
import { GetApplicationsForRequest } from "../domain/use-cases/applications/GetApplicationsForRequest"

import { GetStudyResourcesBySubject } from "../domain/use-cases/resources/GetStudyResourcesBySubject"
import { UploadStudyResource } from "../domain/use-cases/resources/UploadStudyResource"

import { GetConversations } from "../domain/use-cases/messaging/GetConversations"
import { GetMessages } from "../domain/use-cases/messaging/GetMessages"
import { SendMessage } from "../domain/use-cases/messaging/SendMessage"

/**
 * Dependency Injection Container
 * 
 * Centralizes the instantiation of repositories and use cases.
 * This allows easy swapping of implementations (e.g., Supabase → custom API).
 * 
 * Pattern: Service Locator
 */
export class DIContainer {
  private static instance: DIContainer

  // Repositories - lazy initialized
  private studyRequestRepo?: SupabaseStudyRequestRepository
  private applicationRepo?: SupabaseApplicationRepository
  private resourceRepo?: SupabaseStudyResourceRepository
  private messageRepo?: SupabaseMessageRepository
  private conversationRepo?: SupabaseConversationRepository
  private eventRepo?: SupabaseEventRepository
  private studyGroupRepo?: SupabaseStudyGroupRepository

  // Use Cases - lazy initialized
  private getFeedRequests?: GetFeedRequests
  private createStudyRequest?: CreateStudyRequest
  private updateStudyRequest?: UpdateStudyRequest
  private applyToStudyRequest?: ApplyToStudyRequest
  private reviewApplication?: ReviewApplication
  private getApplicationsForRequest?: GetApplicationsForRequest
  private getStudyResourcesBySubject?: GetStudyResourcesBySubject
  private uploadStudyResource?: UploadStudyResource
  private getConversations?: GetConversations
  private getMessages?: GetMessages
  private sendMessage?: SendMessage

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  // ── Repository Getters ────────────────────────────────────────────────────

  getStudyRequestRepository(): SupabaseStudyRequestRepository {
    if (!this.studyRequestRepo) {
      this.studyRequestRepo = new SupabaseStudyRequestRepository()
    }
    return this.studyRequestRepo
  }

  getApplicationRepository(): SupabaseApplicationRepository {
    if (!this.applicationRepo) {
      this.applicationRepo = new SupabaseApplicationRepository()
    }
    return this.applicationRepo
  }

  getStudyResourceRepository(): SupabaseStudyResourceRepository {
    if (!this.resourceRepo) {
      this.resourceRepo = new SupabaseStudyResourceRepository()
    }
    return this.resourceRepo
  }

  getMessageRepository(): SupabaseMessageRepository {
    if (!this.messageRepo) {
      this.messageRepo = new SupabaseMessageRepository()
    }
    return this.messageRepo
  }

  getConversationRepository(): SupabaseConversationRepository {
    if (!this.conversationRepo) {
      this.conversationRepo = new SupabaseConversationRepository()
    }
    return this.conversationRepo
  }

  getEventRepository(): SupabaseEventRepository {
    if (!this.eventRepo) {
      this.eventRepo = new SupabaseEventRepository()
    }
    return this.eventRepo
  }

  getStudyGroupRepository(): SupabaseStudyGroupRepository {
    if (!this.studyGroupRepo) {
      this.studyGroupRepo = new SupabaseStudyGroupRepository()
    }
    return this.studyGroupRepo
  }

  // ── Use Case Getters: Study Requests ──────────────────────────────────────

  getGetFeedRequests(): GetFeedRequests {
    if (!this.getFeedRequests) {
      this.getFeedRequests = new GetFeedRequests(this.getStudyRequestRepository())
    }
    return this.getFeedRequests
  }

  getCreateStudyRequest(): CreateStudyRequest {
    if (!this.createStudyRequest) {
      this.createStudyRequest = new CreateStudyRequest(this.getStudyRequestRepository())
    }
    return this.createStudyRequest
  }

  getUpdateStudyRequest(): UpdateStudyRequest {
    if (!this.updateStudyRequest) {
      this.updateStudyRequest = new UpdateStudyRequest(this.getStudyRequestRepository())
    }
    return this.updateStudyRequest
  }

  // ── Use Case Getters: Applications ────────────────────────────────────────

  getApplyToStudyRequest(): ApplyToStudyRequest {
    if (!this.applyToStudyRequest) {
      this.applyToStudyRequest = new ApplyToStudyRequest(this.getApplicationRepository())
    }
    return this.applyToStudyRequest
  }

  getReviewApplication(): ReviewApplication {
    if (!this.reviewApplication) {
      this.reviewApplication = new ReviewApplication(
        this.getApplicationRepository(),
        this.getStudyRequestRepository()
      )
    }
    return this.reviewApplication
  }

  getGetApplicationsForRequest(): GetApplicationsForRequest {
    if (!this.getApplicationsForRequest) {
      this.getApplicationsForRequest = new GetApplicationsForRequest(
        this.getApplicationRepository(),
        this.getStudyRequestRepository()
      )
    }
    return this.getApplicationsForRequest
  }

  // ── Use Case Getters: Resources ───────────────────────────────────────────

  getGetStudyResourcesBySubject(): GetStudyResourcesBySubject {
    if (!this.getStudyResourcesBySubject) {
      this.getStudyResourcesBySubject = new GetStudyResourcesBySubject(this.getStudyResourceRepository())
    }
    return this.getStudyResourcesBySubject
  }

  getUploadStudyResource(): UploadStudyResource {
    if (!this.uploadStudyResource) {
      this.uploadStudyResource = new UploadStudyResource(this.getStudyResourceRepository())
    }
    return this.uploadStudyResource
  }

  // ── Use Case Getters: Messaging ───────────────────────────────────────────

  getGetConversations(): GetConversations {
    if (!this.getConversations) {
      this.getConversations = new GetConversations(this.getConversationRepository())
    }
    return this.getConversations
  }

  getGetMessages(): GetMessages {
    if (!this.getMessages) {
      this.getMessages = new GetMessages(this.getMessageRepository())
    }
    return this.getMessages
  }

  getSendMessage(): SendMessage {
    if (!this.sendMessage) {
      this.sendMessage = new SendMessage(this.getMessageRepository(), this.getConversationRepository())
    }
    return this.sendMessage
  }
}
