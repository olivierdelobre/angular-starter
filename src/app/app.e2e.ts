import { browser, by, element } from 'protractor';
import 'tslib';

describe('App', () => {

  beforeEach(async () => {
    await browser.get('/#/arbre');
  });

  it('should have a title', async () => {
    let subject = await browser.getTitle();
    let result  = 'Gestion des unités';
    expect(subject).toEqual(result);
  });

});
