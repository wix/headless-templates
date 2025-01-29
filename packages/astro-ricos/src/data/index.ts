import textMock from "./textMock.json";
import paragraphMock from "./paragraphMock.json";
import headingMock from "./headingMock.json";
import captionMock from "./captionMock.json";
import orderedListMock from "./orderedListMock.json";
import bulletedListMock from "./bulletedListMock.json";
import blockquoteMock from "./blockquoteMock.json";
import dividerMock from "./dividerMock.json";
import codeBlockMock from "./codeBlockMock.json";
import collapsibleListMock from "./collapsibleListMock.json";
import tableMock from "./tableMock.json";
import imageMock from "./imageMock.json";
import gifMock from "./gifMock.json";
import videoMock from "./videoMock.json";

const ricosNodesMock = {
  nodes: [
    ...textMock.nodes,
    ...paragraphMock.nodes,
    ...headingMock.nodes,
    ...captionMock.nodes,
    ...orderedListMock.nodes,
    ...bulletedListMock.nodes,
    ...blockquoteMock.nodes,
    ...dividerMock.nodes,
    ...codeBlockMock.nodes,
    ...collapsibleListMock.nodes,
    ...tableMock.nodes,
    ...imageMock.nodes,
    ...gifMock.nodes,
    ...videoMock.nodes,
  ],
};

export default ricosNodesMock;
