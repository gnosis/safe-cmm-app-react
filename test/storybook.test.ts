// See https://storybook.js.org/docs/react/workflows/snapshot-testing for further details
import initStoryshots, {
  Stories2SnapsConverter,
} from "@storybook/addon-storyshots";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

initStoryshots({
  asyncJest: true, // this is the option that activates the async behaviour
  test: ({
    story,
    context,
    done, // --> callback passed to test method when asyncJest option is true
  }) => {
    const converter = new Stories2SnapsConverter();
    const snapshotFilename = converter.getSnapshotFileName(context);
    const storyElement = story.render();
    if (storyElement === undefined) {
      console.log(`story`, story);
      console.log(`context`, context);
    }

    // mount the story
    const tree = mount(storyElement);

    const waitTime = 1;
    setTimeout(() => {
      if (snapshotFilename) {
        expect(toJson(tree.update())).toMatchSpecificSnapshot(snapshotFilename);
      }

      done();
    }, waitTime);
  },
});
