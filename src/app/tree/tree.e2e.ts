import { browser, by, element, Key } from 'protractor';
import * as moment from 'moment';
import 'tslib';

describe('Tree', () => {

  beforeEach(async () => {
    await browser.get('/#/oauth2/Units.mytoken');
  });


  // it('should browse tree',  async () => {
  //   await browser.get('/#/arbre');
  //   await browser.sleep(1000).then(function(){ });
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(4);

  //   // Click EPFL
  //   await element(by.id('chevron-cell-10000')).click();
  //   await browser.sleep(2000).then(function(){ });
  //   expect(await element.all(by.className('unit-row')).count()).toBeGreaterThan(4);
  // });


  // it('should create and delete root unit',  async () => {
  //   await browser.get('/#/arbre');
  //   await browser.sleep(1000).then(function(){ });
  //   await element(by.id('create-root-unit-button')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
  //   expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(false);
  //   // type mandatory info
  //   let labelInput = await element(by.id('input-label'));
  //   await labelInput.sendKeys('Test');
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
  //   let sigleInput = await element(by.id('input-sigle'));
  //   await sigleInput.sendKeys('TEST');
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
  //   let labelShortInput = await element(by.id('input-labelShort'));
  //   await labelShortInput.sendKeys('Test');
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
  //   let fromInput = await element(by.id('input-from'));
  //   await fromInput.sendKeys('1.1.17');
  //   // Now that all mandatory fields are filled, button should be enabled
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(true);

  //   // Save unit
  //   await element(by.id('btn-save-unit-and-close')).click();
  //   await browser.sleep(2000).then(function(){ });
  //   // New unit shouldn't be visible because it's temporary
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(4);

  //   // Uncheck the "Seulement les enreg. permanents" checkbox to make the created unit appear
  //   await element(by.id('filter-only-permanent')).click();
  //   await browser.sleep(2000).then(function(){ });
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(5);

  //   // Delete created root unit
  //   // Click on delete button
  //   let deleteButtons = await element.all(by.className('icon-delete-unit')).get(0).click();
  //   await browser.sleep(1000).then(function(){ });
  //   // Check that deletion popup is displayed
  //   expect(await element(by.id('modal-delete-unit')).isDisplayed()).toBe(true);
  //   // Confirm delete by clicking on the button
  //   await element(by.id('btn-delete-unit-confirmation')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(4);
  // });


  // it('should clone unit',  async () => {
  //   await browser.get('/#/arbre');
  //   await browser.sleep(1000).then(function(){ });

  //   // Open EPFL / SI / SI-IDEV
  //   await element(by.id('chevron-cell-10000')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   await element(by.id('chevron-cell-12635')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   await element(by.id('chevron-cell-13028')).click();
  //   await browser.sleep(1000).then(function(){ });

  //   await element(by.id('clone-unit-13030')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
  //   expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(true);
  //   expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(true);
  //   // Try to save doing no update
  //   await element(by.id('btn-save-unit-and-close')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   // The alert modal should be displayed
  //   expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
  //   // There should be 4 errors displayed
  //   expect(await element.all(by.className('search-result-box-error')).count()).toEqual(4);

  //   // type mandatory info
  //   let labelInput = await element(by.id('input-label'));
  //   await element(by.id('btn-close-modal-alerts')).click();
  //   await browser.sleep(500).then(function(){ });
  //   await labelInput.clear();
  //   await labelInput.sendKeys('SI - Toto');
  //   let sigleInput = await element(by.id('input-sigle'));
  //   await sigleInput.clear();
  //   await sigleInput.sendKeys('TOTO');
  //   let labelShortInput = await element(by.id('input-labelShort'));
  //   await labelShortInput.clear();
  //   await labelShortInput.sendKeys('SI - Toto');
  //   let cfInput = await element(by.id('input-cf'));
  //   await cfInput.clear();
  //   await cfInput.sendKeys('1999');

  //   // Save unit
  //   await element(by.id('btn-save-unit-and-close')).click();
  //   await browser.sleep(2000).then(function(){ });
  //   // New unit should be visible and so we should now have 10 units displayed
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(10);
  //   await browser.sleep(1000).then(function(){ });

  //   // Delete created unit
  //   await browser.get('/#/recherche');
  //   sigleInput = await element(by.id('input-sigle'));
  //   await sigleInput.clear();
  //   await sigleInput.sendKeys('toto');
  //   await element(by.id('search-button')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   // Click on delete button
  //   let deleteButtons = await element.all(by.className('icon-delete-unit')).get(0).click();
  //   await browser.sleep(1000).then(function(){ });
  //   // Check that deletion popup is displayed
  //   expect(await element(by.id('modal-delete-unit')).isDisplayed()).toBe(true);
  //   // Confirm delete by clicking on the button
  //   await element(by.id('btn-delete-unit-confirmation')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(0);
  // });


  // it('should filter tree for CF',  async () => {
  //   await browser.get('/#/arbre');
  //   await browser.sleep(500).then(function(){ });

  //   let filterInput = await element(by.id('input-filter'));
  //   await filterInput.clear();
  //   await filterInput.sendKeys('1906');
  //   await element(by.id('btn-filter')).click();
  //   await browser.sleep(1000).then(function(){ });

  //   // Check that expected unit is visible
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(9);

  //   // Checked that it is bolded
  //   expect(await element(by.id('unit-row-13030')).getAttribute('class')).toBe('unit-row unit-row-IDEVELOP filtered-unit');
  // });


  // it('should filter tree for sigle',  async () => {
  //   await browser.get('/#/arbre');
  //   await browser.sleep(500).then(function(){ });

  //   let filterInput = await element(by.id('input-filter'));
  //   await filterInput.clear();
  //   await filterInput.sendKeys('IDEVELOP');
  //   await element(by.id('btn-filter')).click();
  //   await browser.sleep(1000).then(function(){ });

  //   // Check that expected unit is visible
  //   expect(await element.all(by.className('unit-row')).count()).toEqual(9);

  //   // Checked that it is bolded
  //   expect(await element(by.id('unit-row-13030')).getAttribute('class')).toBe('unit-row unit-row-IDEVELOP filtered-unit');
  // });

  
  it('should create child unit',  async () => {
    await browser.get('/#/arbre');
    await browser.sleep(1000).then(function(){ });

    // Open EPFL / SI / SI-IDEV
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(1000).then(function(){ });
    await element(by.id('chevron-cell-12635')).click();
    await browser.sleep(1000).then(function(){ });
    await element(by.id('chevron-cell-13028')).click();
    await browser.sleep(1000).then(function(){ });
    
    await element(by.id('create-child-unit-13028')).click();
    await browser.sleep(1000).then(function(){ });

    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(false);
    
    // type mandatory info
    let labelInput = await element(by.id('input-label'));
    await labelInput.sendKeys('SI - Développement');
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.sendKeys('IDEVELOP');
    let labelShortInput = await element(by.id('input-labelShort'));
    await labelShortInput.sendKeys('SI - Développement');
    let cfInput = await element(by.id('input-cf'));
    await cfInput.sendKeys('1906');
    let fromInput = await element(by.id('input-from'));
    await fromInput.sendKeys('1.1.17');
    await element(by.id('input-isTemporary')).click();

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 4 errors displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(4);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Change CF
    await cfInput.clear();
    await cfInput.sendKeys('1999');
    await labelInput.clear();
    await labelInput.sendKeys('SI - Développement');
    await sigleInput.clear();
    await sigleInput.sendKeys('IDEVELOP');
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - Développement');

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 3 errors displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(3);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Change Label
    await labelInput.clear();
    await labelInput.sendKeys('SI - Développement2');
    await sigleInput.clear();
    await sigleInput.sendKeys('IDEVELOP');
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - Développement');
    
    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 2 errors displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(2);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Change sigle
    await sigleInput.clear();
    await sigleInput.sendKeys('IDEVELOP2');
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - Développement');
    
    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 1 errors displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(1);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Change LabelShort
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - Développement2');
    
    // Save unit, now it should be fine
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });
    // The update modal should be closed
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(false);
    // New unit should be visible
    expect(await element.all(by.className('unit-row')).count()).toEqual(10);
  });


  it('should update unit',  async () => {
    await browser.get('/#/arbre');
    await browser.sleep(500).then(function(){ });

    // Open EPFL / SI / SI-IDEV
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(500).then(function(){ });
    await element(by.id('chevron-cell-12635')).click();
    await browser.sleep(500).then(function(){ });
    await element(by.id('chevron-cell-13028')).click();
    await browser.sleep(500).then(function(){ });
    
    // Open the IDEVELOP2 unit for update
    await element.all(by.className('label-cell-IDEVELOP2')).get(0).click();
    await browser.sleep(2000).then(function(){ });

    let labelInput = await element(by.id('input-label'));
    await labelInput.sendKeys('t');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Go on "Historique" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(2);

    // Go back to "Données de base" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Données de base')).click();
    await browser.sleep(500).then(function(){ });

    // Update Type, Responsible and Room, and validate Responsible and Room by typing ENTER
    await element(by.cssContainingText('#input-type > option', 'Service central')).click();
    let responsibleInput = await element(by.id('input-responsible-search'));
    await responsibleInput.sendKeys('268229');
    await responsibleInput.sendKeys(Key.ENTER);
    let roomInput = await element(by.id('input-room-search'));
    await roomInput.sendKeys('inn013');
    await roomInput.sendKeys(Key.ENTER);
    await browser.sleep(500).then(function(){ });

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Go on "Historique" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(5);
    await browser.sleep(500).then(function(){ });

    // Go back to "Données de base" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Données de base')).click();
    await browser.sleep(500).then(function(){ });

    // Update Type, Responsible and Room, do not validate Responsible and Room
    await element.all(by.id('btn-clear-responsible')).click();
    await responsibleInput.sendKeys('240209');
    await element.all(by.id('btn-clear-room')).click();
    await roomInput.sendKeys('inn041');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Go on "Historique" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(7);
    await browser.sleep(500).then(function(){ });

    // Go on "Compléments" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Compléments')).click();
    await browser.sleep(500).then(function(){ });

    //************************************************************************
    // Add attributes
    //************************************************************************
    // Add attribute 1
    await element(by.id('btn-create-attribute-AFFICHAGE')).click();
    await browser.sleep(1000).then(function(){ });
    // The attribute modal should be visible
    expect(await element(by.id('modal-attribute')).isDisplayed()).toBe(true);
    expect(await element(by.id('select-attribute-value')).isDisplayed()).toBe(true);
    expect(await element.all(by.css('#select-attribute-value > option')).count()).toEqual(12);
    // Select attribute type "Antenne différenciée par canton"
    await element(by.cssContainingText('#select-attribute-type > option', 'Antenne différenciée par canton')).click();
    await browser.sleep(500).then(function(){ });
    // Check that value list has been updated
    expect(await element.all(by.css('#select-attribute-value > option')).count()).toEqual(2);
    // Check that validFrom is date of the day
    expect(await element(by.id('input-attribute-validFrom')).getAttribute('value')).toBe(moment().format('DD.MM.YYYY'));
    await element(by.id('btn-save-attribute')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.css('.box-attribute-value')).count()).toEqual(1);

    // Add attribute 2
    await element(by.id('btn-create-attribute-BRANCHE-SIUS')).click();
    await browser.sleep(1000).then(function(){ });
    expect(await element(by.id('modal-attribute')).isDisplayed()).toBe(true);
    expect(await element(by.id('input-attribute-value')).isDisplayed()).toBe(true);
    let attributeValueInput = await element(by.id('input-attribute-value'));
    attributeValueInput.sendKeys('TOTO');
    await element(by.id('btn-save-attribute')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.css('.box-attribute-value')).count()).toEqual(2);
    
    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Check "Historique"
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(9);
    await browser.sleep(500).then(function(){ });


    //************************************************************************
    // Update attribute
    //************************************************************************
    // Go on "Compléments" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Compléments')).click();
    await browser.sleep(500).then(function(){ });
    // Click on first update button
    await element.all(by.className('btn-update-attribute')).get(0).click();
    await browser.sleep(500).then(function(){ });
    expect(await element(by.id('modal-attribute')).isDisplayed()).toBe(true);
    await element(by.cssContainingText('#select-attribute-value > option', 'VS - Valais')).click();
    await element(by.id('btn-save-attribute')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.css('.box-attribute-value')).count()).toEqual(2);

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Check "Historique"
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(10);
    await browser.sleep(500).then(function(){ });


    //************************************************************************
    // Delete attribute
    //************************************************************************
    // Go on "Compléments" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Compléments')).click();
    await browser.sleep(500).then(function(){ });
    // Click on first update button
    await element.all(by.className('btn-delete-attribute')).get(0).click();
    expect(await element.all(by.css('.box-attribute-value')).count()).toEqual(1);

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Check "Historique"
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(11);
    await browser.sleep(500).then(function(){ });


    //************************************************************************
    // Add multilingual attribute
    //************************************************************************
    // Go on "Libellés multilingues" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Libellés multilingues')).click();
    await browser.sleep(500).then(function(){ });
    let sigleEnInput = await element(by.id('input-sigleEn'));
    sigleEnInput.sendKeys('IDEVELOP2');
    let labelEnInput = await element(by.id('input-labelEn'));
    labelEnInput.sendKeys('SI - Développement2');
    let labelShortEnInput = await element(by.id('input-labelShortEn'));
    labelShortEnInput.sendKeys('SI - Développement2');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Check "Historique"
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(14);
    await browser.sleep(500).then(function(){ });


    //************************************************************************
    // Address
    //************************************************************************
    // Go back to "Données de base" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Données de base')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.css('a.nav-link > span')).count()).toEqual(4);
    await element(by.id('btn-clear-room')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.css('a.nav-link > span')).count()).toEqual(5);

    // Go to "Adresse" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Adresse')).click();
    await browser.sleep(500).then(function(){ });
    // Update address3
    let address3Input = await element(by.id('input-address3'));
    address3Input.sendKeys('1');

    // Search for country "fr"
    let countrySearchInput = await element(by.id('input-country-search'));
    countrySearchInput.sendKeys('fr');
    countrySearchInput.sendKeys(Key.ENTER);
    await browser.sleep(500).then(function(){ });
    // Check that country has been updated in UI
    expect(await element(by.id('box-selected-country')).getText()).toBe('France');

    // Search for country "su"
    countrySearchInput.sendKeys('su');
    countrySearchInput.sendKeys(Key.ENTER);
    await browser.sleep(500).then(function(){ });
    expect(await element(by.id('modal-select-country')).isDisplayed()).toBe(true);
    await browser.sleep(500).then(function(){ });
    await element(by.id('btn-select-country-CH')).click();
    await browser.sleep(500).then(function(){ });
    // Check that country has been updated in UI
    expect(await element(by.id('box-selected-country')).getText()).toBe('Suisse');

    // Search for location "ge"
    let locationSearchInput = await element(by.id('input-location-search'));
    locationSearchInput.sendKeys('ge');
    locationSearchInput.sendKeys(Key.ENTER);
    await browser.sleep(500).then(function(){ });
    expect(await element(by.id('modal-select-location')).isDisplayed()).toBe(true);
    await browser.sleep(500).then(function(){ });
    await element(by.id('btn-select-location-1201')).click();
    await browser.sleep(500).then(function(){ });
    // Check that lccation has been updated in UI
    expect(await element(by.id('box-selected-location')).getText()).toBe('1201 Genève 01');
    
    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Check "Historique"
    await element.all(by.cssContainingText('a.nav-link > span', 'Historique')).click();
    await browser.sleep(500).then(function(){ });
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(17);
    await browser.sleep(5000).then(function(){ });
  });


  it('should delete unit from search',  async () => {
    // Delete created unit
    await browser.get('/#/recherche');
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.clear();
    await sigleInput.sendKeys('iDevelOP2');
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

  // TODO
  // Move Unit
  // Set end date and check attributes


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
