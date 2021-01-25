export const mockChangeSettingsHandler = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return { changeSettingsHandler: mockChangeSettingsHandler };
});

export default mock;