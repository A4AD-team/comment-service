import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../src/comments/schemas/comment.schema';
import { CommentsModule } from '../src/comments/comments.module';
import { ConfigModule } from '@nestjs/config';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let commentModel: Model<Comment>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: Comment.name, schema: CommentSchema },
        ]),
        CommentsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipe();

    commentModel = moduleFixture.get<Model<Comment>>(
      getModelToken(Comment.name),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await commentModel.deleteMany({});
  });

  describe('POST /comments', () => {
    it('should create a comment', async () => {
      const createDto = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        authorId: '123e4567-e89b-12d3-a456-426614174001',
        content: 'Test comment content',
      };

      const response = await request(app.getHttpServer())
        .post('/comments')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.content).toBe(createDto.content);
      expect(response.body.data.commentId).toBeDefined();
    });

    it('should reject invalid input', async () => {
      const invalidDto = {
        postId: 'invalid-uuid',
        content: '',
      };

      await request(app.getHttpServer())
        .post('/comments')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /comments', () => {
    it('should return paginated comments', async () => {
      // Create test comments
      await commentModel.create([
        {
          commentId: 'test-1',
          postId: 'post-1',
          authorId: 'author-1',
          content: 'Comment 1',
          likesCount: 0,
          isDeleted: false,
        },
        {
          commentId: 'test-2',
          postId: 'post-1',
          authorId: 'author-1',
          content: 'Comment 2',
          likesCount: 0,
          isDeleted: false,
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/comments')
        .query({ postId: 'post-1', limit: 10 })
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.totalCount).toBe(2);
    });
  });

  describe('GET /comments/:commentId', () => {
    it('should return a comment by id', async () => {
      await commentModel.create({
        commentId: 'test-comment',
        postId: 'post-1',
        authorId: 'author-1',
        content: 'Test comment',
        likesCount: 0,
        isDeleted: false,
      });

      const response = await request(app.getHttpServer())
        .get('/comments/test-comment')
        .expect(200);

      expect(response.body.data.commentId).toBe('test-comment');
    });

    it('should return 404 for non-existent comment', async () => {
      await request(app.getHttpServer())
        .get('/comments/non-existent')
        .expect(404);
    });
  });

  describe('PATCH /comments/:commentId', () => {
    it('should update a comment', async () => {
      await commentModel.create({
        commentId: 'test-update',
        postId: 'post-1',
        authorId: 'author-1',
        content: 'Original content',
        likesCount: 0,
        isDeleted: false,
      });

      const response = await request(app.getHttpServer())
        .patch('/comments/test-update')
        .set('x-user-id', 'author-1')
        .send({ content: 'Updated content' })
        .expect(200);

      expect(response.body.data.content).toBe('Updated content');
    });
  });

  describe('POST /comments/:commentId/like', () => {
    it('should like a comment', async () => {
      await commentModel.create({
        commentId: 'test-like',
        postId: 'post-1',
        authorId: 'author-1',
        content: 'Test content',
        likesCount: 0,
        isDeleted: false,
      });

      const response = await request(app.getHttpServer())
        .post('/comments/test-like/like')
        .set('x-user-id', 'user-1')
        .expect(201);

      expect(response.body.data.likesCount).toBe(1);
    });
  });

  describe('DELETE /comments/:commentId', () => {
    it('should soft delete a comment', async () => {
      await commentModel.create({
        commentId: 'test-delete',
        postId: 'post-1',
        authorId: 'author-1',
        content: 'Test content',
        likesCount: 0,
        isDeleted: false,
      });

      await request(app.getHttpServer())
        .delete('/comments/test-delete')
        .set('x-user-id', 'author-1')
        .expect(204);

      const comment = await commentModel.findOne({ commentId: 'test-delete' });
      expect(comment?.isDeleted).toBe(true);
    });
  });
});
