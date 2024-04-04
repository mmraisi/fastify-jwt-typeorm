import sinon from "sinon";

export const buildMockFastify = () => {
  return {
    log: {
      info: sinon.stub(),
    },
    db: {
      getRepository: sinon.stub(),
    },
    jwt: sinon.stub(),
  };
};
export const buildMockReply = () => {
  const mockReply = {
    code: sinon.stub().returnsThis(),
    type: sinon.stub().returnsThis(),
    send: sinon.stub().returnsThis(),
    header: sinon.stub().returnsThis(),
    redirect: sinon.stub().returnsThis(),
  };

  return mockReply;
};
