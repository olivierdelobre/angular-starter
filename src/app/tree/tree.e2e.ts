import { browser, by, element } from 'protractor';
import 'tslib';

describe('Tree', () => {

  beforeEach(async () => {
    await browser.get('/#/oauth2/Units.mytoken');
  });


  it('should browse tree',  async () => {
    await browser.get('/#/arbre');
    await browser.sleep(1000).then(function(){ });
    expect(await element.all(by.className('unit-row')).count()).toEqual(4);

    // Click EPFL
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element.all(by.className('unit-row')).count()).toBeGreaterThan(4);
  });


  it('should create and delete root unit',  async () => {
    await browser.get('/#/arbre');
    await browser.sleep(1000).then(function(){ });
    await element(by.id('create-root-unit-button')).click();
    await browser.sleep(1000).then(function(){ });
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(false);
    // type mandatory info
    let labelInput = await element(by.id('input-label'));
    await labelInput.sendKeys('Test');
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.sendKeys('TEST');
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    let labelShortInput = await element(by.id('input-labelShort'));
    await labelShortInput.sendKeys('Test');
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    let fromInput = await element(by.id('input-from'));
    await fromInput.sendKeys('1.1.17');
    // Now that all mandatory fields are filled, button should be enabled
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(true);

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(2000).then(function(){ });
    // New unit shouldn't be visible because it's temporary
    expect(await element.all(by.className('unit-row')).count()).toEqual(4);

    // Uncheck the "Seulement les enreg. permanents" checkbox to make the created unit appear
    await element(by.id('filter-only-permanent')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element.all(by.className('unit-row')).count()).toEqual(5);

    // Delete created root unit
    // Click on delete button
    let deleteButtons = await element.all(by.className('icon-delete-unit')).get(0).click();
    await browser.sleep(1000).then(function(){ });
    // Check that deletion popup is displayed
    expect(await element(by.id('modal-delete-unit')).isDisplayed()).toBe(true);
    // Confirm delete by clicking on the button
    await element(by.id('btn-delete-unit-confirmation')).click();
    await browser.sleep(1000).then(function(){ });
    expect(await element.all(by.className('unit-row')).count()).toEqual(4);
  });


  it('should clone unit',  async () => {
    await browser.get('/#/arbre');
    await browser.sleep(1000).then(function(){ });

    // Open EPFL
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(1000).then(function(){ });
    await element(by.id('chevron-cell-12635')).click();
    await browser.sleep(1000).then(function(){ });
    await element(by.id('chevron-cell-13028')).click();
    await browser.sleep(1000).then(function(){ });

    await element(by.id('clone-unit-13030')).click();
    await browser.sleep(1000).then(function(){ });
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(true);
    expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(true);
    // Try to save doing no update
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 4 errors displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(4);

    // type mandatory info
    let labelInput = await element(by.id('input-label'));
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });
    await labelInput.clear();
    await labelInput.sendKeys('SI - Toto');
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.clear();
    await sigleInput.sendKeys('TOTO');
    let labelShortInput = await element(by.id('input-labelShort'));
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - Toto');
    let cfInput = await element(by.id('input-cf'));
    await cfInput.clear();
    await cfInput.sendKeys('1999');

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(2000).then(function(){ });
    // New unit should be visible and so we should now have 10 units displayed
    expect(await element.all(by.className('unit-row')).count()).toEqual(10);
    await browser.sleep(5000).then(function(){ });

    // Delete created unit
    await browser.get('/#/recherche');
    sigleInput = await element(by.id('input-sigle'));
    await sigleInput.clear();
    await sigleInput.sendKeys('toto');
    await element(by.id('search-button')).click();
    await browser.sleep(1000).then(function(){ });
    // Click on delete button
    let deleteButtons = await element.all(by.className('icon-delete-unit')).get(0).click();
    await browser.sleep(1000).then(function(){ });
    // Check that deletion popup is displayed
    expect(await element(by.id('modal-delete-unit')).isDisplayed()).toBe(true);
    // Confirm delete by clicking on the button
    await element(by.id('btn-delete-unit-confirmation')).click();
    await browser.sleep(1000).then(function(){ });
    expect(await element.all(by.className('unit-row')).count()).toEqual(0);
  });

  // beforeEach(() => {
    // browser.get('/#/oauth2/Units.d14b30ef4d67a29b9481e2891419a5a4e41dc2ef');
    // let usernameInput = element(by.id('username'));
    // let usernamePassword = element(by.id('password'));
    // usernameInput.clear();
    // usernameInput.sendKeys('test');
    // usernamePassword.clear();
    // usernamePassword.sendKeys('test');

    // element(by.css('button.btn-primary')).click();
  // });

  /*
  it('should expand tree and update unit', () => {
    browser.get('/#/arbre');
    browser.sleep(1000).then(function(){ });

    let subject = browser.getTitle();
    let result  = 'Gestion des unités';
    expect(subject).toEqual(result);

    let h1 = element(by.tagName('h1')).getText();
    result  = 'ARBRE DES UNITÉS';
    expect(h1).toEqual(result);

    //test click on a unit
    //let chevron = element(by.css('div.chevron-cell'));
    let chevron = element(by.id('chevron-cell-10000'));
    chevron.click();
    browser.sleep(1000).then(function(){ });

    chevron = element(by.id('chevron-cell-12635'));
    chevron.click();
    browser.sleep(1000).then(function(){ });

    chevron = element(by.id('chevron-cell-13028'));
    chevron.click();
    browser.sleep(1000).then(function(){ });

    //test if new labels have been loaded and if value is as expected
    let labels = element.all(by.css('div.label-cell'));
    expect(labels.count()).toBeGreaterThan(4);
    let labelIDEVELOP = element(by.id('label-cell-13030'));
    expect(labelIDEVELOP).not.toBeNull();
    expect(labelIDEVELOP.getText()).toContain('SI - Développement');

    //click on label to open modal
    labelIDEVELOP.click();
    browser.sleep(1000).then(function(){ });
    expect(element(by.id('modal-update-unit')).isDisplayed()).toBe(true);

    //text responsible auto complete
    let responsibleInput = element(by.css('#update-unit-responsible input'));
    responsibleInput.clear();
    browser.sleep(1000).then(function(){ });
    responsibleInput.sendKeys('DELOBRE');
    browser.sleep(2000).then(function(){ });

    let responsibleList = element(by.css('#update-unit-responsible ul.ui-autocomplete-items'));
    expect(responsibleList.isDisplayed()).toBe(true);
    let responsibleItem = element(by.css('#update-unit-responsible > span > div > ul.ui-autocomplete-items > li > span'));
    expect(responsibleItem.getText()).toContain('DELOBRE OLIVIER ROMAIN');
    responsibleItem.click();

    //text room auto complete
    let roomInput = element(by.css('#update-unit-room input'));
    roomInput.clear();
    browser.sleep(1000).then(function(){ });
    roomInput.sendKeys('INN 0');
    browser.sleep(2000).then(function(){ });

    let roomList = element(by.css('#update-unit-room ul.ui-autocomplete-items'));
    expect(roomList.isDisplayed()).toBe(true);
    let roomItem = element(by.css('#update-unit-room > span > div > ul.ui-autocomplete-items > li > span'));
    expect(roomItem.getText()).toContain('INN 0');
    roomItem.click();

    //validate changes
    element(by.id('btn-submit-unit-update')).click();
    browser.sleep(1000).then(function(){ });
    expect(element(by.id('modal-update-unit')).isDisplayed()).toBe(false);

    //reopen to check values
    labelIDEVELOP.click();
    browser.sleep(1000).then(function(){ });
    expect(responsibleInput.getAttribute('value')).toBe('DELOBRE OLIVIER ROMAIN');
    expect(roomInput.getAttribute('value')).toBe('INN 027');
    expect(element(by.id('update-unit-address')).getAttribute('value')).toBe('EPFL SI IDEVELOP, INN 027 (Bâtiment INN), Station 14, CH-1015 Lausanne');

    //close modal
    element(by.id('btn-close-unit-update')).click();
    browser.sleep(1000).then(function(){ });
    expect(element(by.id('modal-update-unit')).isDisplayed()).toBe(false);
  });
  */

});
