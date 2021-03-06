export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ConstraintString: any;
  ConstraintNumber: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
};





export enum TagType {
  Descriptor = 'DESCRIPTOR',
  List = 'LIST'
}

export type TagBase = {
  displayName: Scalars['String'];
  tagType: TagType;
};

export type Tag = TagBase & {
   __typename?: 'Tag';
  id: Scalars['Int'];
  munge: Scalars['String'];
  displayName: Scalars['String'];
  createdBy: Scalars['String'];
  creator?: Maybe<User>;
  createdAt: Scalars['String'];
  password: Scalars['String'];
  tagType: TagType;
  tagPosition?: Maybe<Scalars['Int']>;
};

export type TagNew = {
  displayName: Scalars['String'];
  tagType: TagType;
};

export enum TagQueryOrder {
  DisplayName = 'DISPLAY_NAME',
  CreatedAt = 'CREATED_AT'
}

export type TagQuery = {
  displayName?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['Int']>>;
  tagTypes: Array<TagType>;
  order?: Maybe<TagQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  after?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export enum ReactionType {
  Star = 'STAR',
  Flag = 'FLAG'
}

export type Reaction = {
   __typename?: 'Reaction';
  chartID: Scalars['Int'];
  reactionType: ReactionType;
  createdBy: Scalars['String'];
  createdAt: Scalars['String'];
};

export type ReactionNew = {
  chartID: Scalars['Int'];
  uid: Scalars['String'];
  reactionType: ReactionType;
};

export enum ChartType {
  Chord = 'CHORD',
  Progression = 'PROGRESSION'
}

export type ChartBase = {
  audioURL: Scalars['String'];
  audioLength: Scalars['Int'];
  hint?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  tags: Array<Tag>;
  chartType: ChartType;
  bassNote?: Maybe<Note>;
  root?: Maybe<Note>;
  quality: ChartQuality;
  extensions?: Maybe<Array<Extension>>;
};

export type ReactionCounts = {
   __typename?: 'ReactionCounts';
  stars: Scalars['Int'];
  flags: Scalars['Int'];
};

export type Chart = ChartBase & {
   __typename?: 'Chart';
  id: Scalars['Int'];
  audioURL: Scalars['String'];
  audioLength: Scalars['Int'];
  imageURL?: Maybe<Scalars['String']>;
  hint?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  tags: Array<Tag>;
  chartType: ChartType;
  bassNote?: Maybe<Note>;
  root?: Maybe<Note>;
  quality: ChartQuality;
  createdAt: Scalars['String'];
  createdBy: Scalars['String'];
  updatedAt?: Maybe<Scalars['String']>;
  creator?: Maybe<User>;
  extensions?: Maybe<Array<Extension>>;
  reactionCounts: ReactionCounts;
  userReactionType?: Maybe<ReactionType>;
};

export type ChartNew = {
  audioURL: Scalars['String'];
  audioLength: Scalars['Int'];
  imageURL?: Maybe<Scalars['String']>;
  hint?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  abc: Scalars['String'];
  chartType: ChartType;
  bassNote?: Maybe<Note>;
  root?: Maybe<Note>;
  quality?: Maybe<ChartQuality>;
  extensionIDs?: Maybe<Array<Scalars['Int']>>;
  tags: Array<TagNew>;
};

export enum Note {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B',
  Cb = 'Cb',
  Db = 'Db',
  Eb = 'Eb',
  Fb = 'Fb',
  Gb = 'Gb',
  Ab = 'Ab',
  Bb = 'Bb',
  Cs = 'Cs',
  Ds = 'Ds',
  Es = 'Es',
  Fs = 'Fs',
  Gs = 'Gs',
  As = 'As',
  Bs = 'Bs'
}

export enum ChartQuality {
  Major = 'MAJOR',
  Minor = 'MINOR',
  Sus2 = 'SUS2',
  Sus4 = 'SUS4',
  Diminished = 'DIMINISHED',
  Augmented = 'AUGMENTED'
}

export enum ExtensionType {
  Sharp = 'SHARP',
  Flat = 'FLAT',
  Plain = 'PLAIN'
}

export type ExtensionNew = {
   __typename?: 'ExtensionNew';
  extensionType: ExtensionType;
  degree: Scalars['Int'];
};

export type Extension = {
   __typename?: 'Extension';
  id: Scalars['Int'];
  extensionType: ExtensionType;
  degree: Scalars['Int'];
};

export type ChartUpdate = {
  id: Scalars['Int'];
  audioURL?: Maybe<Scalars['String']>;
  audioLength?: Maybe<Scalars['Int']>;
  bassNote?: Maybe<Note>;
  root?: Maybe<Note>;
  quality?: Maybe<ChartQuality>;
  hint?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  abc?: Maybe<Scalars['String']>;
  imageURL?: Maybe<Scalars['String']>;
  extensionIDs?: Maybe<Array<Scalars['Int']>>;
  tags?: Maybe<Array<TagNew>>;
};

export enum ChartQueryOrder {
  ThumbsUp = 'THUMBS_UP',
  CreatedAt = 'CREATED_AT',
  TagPosition = 'TAG_POSITION',
  Random = 'RANDOM'
}

export type ChartQuery = {
  id?: Maybe<Scalars['Int']>;
  tagIDs?: Maybe<Array<Scalars['Int']>>;
  chartTypes: Array<ChartType>;
  after?: Maybe<Scalars['Int']>;
  order?: Maybe<ChartQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
};

export type UserBase = {
  username: Scalars['String'];
};

export type User = UserBase & {
   __typename?: 'User';
  uid: Scalars['String'];
  username: Scalars['String'];
  createdAt: Scalars['String'];
  settings: Scalars['JSONObject'];
};

export type UserNew = {
  username: Scalars['String'];
};

export type UserUpdate = {
  username: Scalars['String'];
  settings?: Maybe<Scalars['JSONObject']>;
};

export enum UserQueryOrder {
  CreatedBy = 'CREATED_BY',
  Username = 'USERNAME'
}

export type UserQuery = {
  uid?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  order?: Maybe<UserQueryOrder>;
  asc?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
};

export enum ErrorType {
  Unauthenticated = 'UNAUTHENTICATED',
  ChartNotFound = 'CHART_NOT_FOUND',
  InvalidChartTagError = 'INVALID_CHART_TAG_ERROR',
  InvalidChartReaction = 'INVALID_CHART_REACTION',
  InvalidTagPositionUpdate = 'INVALID_TAG_POSITION_UPDATE',
  DuplicateUsername = 'DUPLICATE_USERNAME',
  Unhandled = 'UNHANDLED',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  ForbiddenResourceOperation = 'FORBIDDEN_RESOURCE_OPERATION',
  InvalidInvitationToken = 'INVALID_INVITATION_TOKEN',
  NotFound = 'NOT_FOUND'
}

export type ErrorException = {
   __typename?: 'ErrorException';
  stacktrace?: Maybe<Array<Scalars['String']>>;
};

export type ErrorExtensions = {
   __typename?: 'ErrorExtensions';
  msgArgs?: Maybe<Array<Scalars['String']>>;
  code: ErrorType;
  exception?: Maybe<ErrorException>;
};

export enum PolicyResourceType {
  Tag = 'TAG'
}

export enum PolicyAction {
  Wildcard = 'WILDCARD',
  Read = 'READ',
  Write = 'WRITE'
}

export type PolicyResource = {
  resourceType: PolicyResourceType;
  resourceID: Scalars['Int'];
};

export type Policy = {
   __typename?: 'Policy';
  id: Scalars['Int'];
  resourceType: PolicyResourceType;
  resourceID: Scalars['Int'];
  invitationID?: Maybe<Scalars['Int']>;
  action: PolicyAction;
  uid: Scalars['String'];
  user?: Maybe<User>;
  expiresAt?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
};

export type NewPolicy = {
  resourceType: PolicyResourceType;
  resourceID: Scalars['Int'];
  action: PolicyAction;
  uid: Scalars['String'];
  expiresAt?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
};

export type PolicyQuery = {
  resource: PolicyResource;
};

export type Invitation = {
   __typename?: 'Invitation';
  id: Scalars['Int'];
  resourceType: PolicyResourceType;
  resourceID: Scalars['Int'];
  action: PolicyAction;
  expiresAt?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
};

export type NewInvitation = {
  resourceType: PolicyResourceType;
  resourceID: Scalars['Int'];
  action: PolicyAction;
  expiresAt?: Maybe<Scalars['String']>;
};

export type InvitationQuery = {
  resource: PolicyResource;
};

export type Empty = {
   __typename?: 'Empty';
  empty?: Maybe<Scalars['Boolean']>;
};

export type Query = {
   __typename?: 'Query';
  me: User;
  users: Array<User>;
  charts: Array<Chart>;
  tags: Array<Tag>;
  extensions: Array<Extension>;
  invitations: Array<Invitation>;
  policies: Array<Policy>;
};


export type QueryUsersArgs = {
  query: UserQuery;
};


export type QueryChartsArgs = {
  query: ChartQuery;
};


export type QueryTagsArgs = {
  query: TagQuery;
};


export type QueryInvitationsArgs = {
  query?: Maybe<InvitationQuery>;
};


export type QueryPoliciesArgs = {
  query: PolicyQuery;
};

export type CreateInvitationResponse = {
   __typename?: 'CreateInvitationResponse';
  token: Scalars['String'];
};

export type Mutation = {
   __typename?: 'Mutation';
  createUser?: Maybe<User>;
  updateUser?: Maybe<User>;
  deleteUser?: Maybe<Empty>;
  react?: Maybe<Chart>;
  createChart?: Maybe<Chart>;
  updateChart?: Maybe<Chart>;
  deleteChart?: Maybe<Empty>;
  addExtensions?: Maybe<Chart>;
  removeExtensions?: Maybe<Chart>;
  createTags: Array<Tag>;
  deleteTag?: Maybe<Empty>;
  deleteTagAccessPolicy?: Maybe<Empty>;
  addTags?: Maybe<Chart>;
  unTag?: Maybe<Chart>;
  setTagPositions?: Maybe<Array<Maybe<Chart>>>;
  createInvitation: CreateInvitationResponse;
  deleteInvitation?: Maybe<Empty>;
  acceptInvitation?: Maybe<Tag>;
  createPolicy?: Maybe<Policy>;
  deletePolicy?: Maybe<Empty>;
};


export type MutationCreateUserArgs = {
  newUser: UserNew;
};


export type MutationUpdateUserArgs = {
  userUpdate: UserUpdate;
};


export type MutationReactArgs = {
  reactionNew?: Maybe<ReactionNew>;
};


export type MutationCreateChartArgs = {
  chartNew: ChartNew;
};


export type MutationUpdateChartArgs = {
  chartUpdate: ChartUpdate;
};


export type MutationDeleteChartArgs = {
  chartID: Scalars['Int'];
};


export type MutationAddExtensionsArgs = {
  chartID: Scalars['Int'];
  extensionIDs: Array<Scalars['Int']>;
};


export type MutationRemoveExtensionsArgs = {
  chartID: Scalars['Int'];
  extensionIDs: Array<Scalars['Int']>;
};


export type MutationCreateTagsArgs = {
  tagNews: Array<TagNew>;
};


export type MutationDeleteTagArgs = {
  tagID: Scalars['Int'];
};


export type MutationDeleteTagAccessPolicyArgs = {
  tagID: Scalars['Int'];
};


export type MutationAddTagsArgs = {
  chartID: Scalars['Int'];
  tags: Array<TagNew>;
};


export type MutationUnTagArgs = {
  chartID: Scalars['Int'];
  tagIDs: Array<Scalars['Int']>;
};


export type MutationSetTagPositionsArgs = {
  tagID: Scalars['Int'];
  chartIDs: Array<Scalars['Int']>;
  positions: Array<Scalars['Int']>;
};


export type MutationCreateInvitationArgs = {
  invitation: NewInvitation;
  tokenExpirationHours?: Maybe<Scalars['Int']>;
};


export type MutationDeleteInvitationArgs = {
  invitationID: Scalars['Int'];
};


export type MutationAcceptInvitationArgs = {
  token: Scalars['String'];
};


export type MutationCreatePolicyArgs = {
  policy: NewPolicy;
};


export type MutationDeletePolicyArgs = {
  policyID: Scalars['Int'];
};

