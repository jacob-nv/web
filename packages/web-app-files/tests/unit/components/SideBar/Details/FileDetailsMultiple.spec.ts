import FileDetailsMultiple from '../../../../../src/components/SideBar/Details/FileDetailsMultiple.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

const selectors = {
  selectedFilesText: '[data-testid="selectedFilesText"]',
  filesCount: '[data-testid="filesCount"]',
  foldersCount: '[data-testid="foldersCount"]',
  size: '[data-testid="size"]'
}

const folderA = {
  id: '1',
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const folderB = {
  id: '2',
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const fileA = {
  id: '3',
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const fileB = {
  id: '4',
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

describe('Details Multiple Selection SideBar Item', () => {
  it('should display information for two selected folders', () => {
    const { wrapper } = createWrapper([folderA, folderB])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 0')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 2')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 kB')
  })
  it('should display information for two selected files', () => {
    const { wrapper } = createWrapper([fileA, fileB])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 2')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 0')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 kB')
  })
  it('should display information for one selected file, one selected folder', () => {
    const { wrapper } = createWrapper([fileA, folderA])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 1')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 1')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 kB')
  })
})

function createWrapper(resources) {
  return {
    wrapper: shallowMount(FileDetailsMultiple, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              resourcesStore: { resources, selectedIds: resources.map(({ id }) => id) }
            }
          })
        ]
      }
    })
  }
}
