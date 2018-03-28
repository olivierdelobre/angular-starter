import { browser, by, element, Key } from 'protractor';
import * as moment from 'moment';
import 'tslib';

describe('Tree', () => {

  beforeEach(async () => {
    await browser.get('/#/oauth2/Units.mytoken');
  });

  /***********************************************************************************************************
   * 
   * 
   * Create and delete root unit
   * 
   * 
   ************************************************************************************************************/
  it('should create and delete root unit',  async () => {
    await browser.get('/#/unites');
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

  /***********************************************************************************************************
   * 
   * 
   * Clone a unit
   * 
   * 
   ************************************************************************************************************/
  it('should clone unit',  async () => {
    await browser.get('/#/unites');
    await browser.sleep(1000).then(function(){ });

    // Open EPFL / SI / SI-IDEV
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
    await browser.sleep(1000).then(function(){ });

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


  it('should filter tree for CF',  async () => {
    await browser.get('/#/unites');
    await browser.sleep(500).then(function(){ });

    let filterInput = await element(by.id('input-filter'));
    await filterInput.clear();
    await filterInput.sendKeys('1906');
    await element(by.id('btn-filter')).click();
    await browser.sleep(1000).then(function(){ });

    // Check that expected unit is visible
    expect(await element.all(by.className('unit-row')).count()).toEqual(9);

    // Checked that it is bolded
    expect(await element(by.id('unit-row-13030')).getAttribute('class')).toBe('unit-row unit-row-IDEVELOP filtered-unit');
  });


  it('should filter tree for sigle',  async () => {
    await browser.get('/#/unites');
    await browser.sleep(500).then(function(){ });

    let filterInput = await element(by.id('input-filter'));
    await filterInput.clear();
    await filterInput.sendKeys('IDEVELOP');
    await element(by.id('btn-filter')).click();
    await browser.sleep(1000).then(function(){ });

    // Check that expected unit is visible
    expect(await element.all(by.className('unit-row')).count()).toEqual(9);

    // Checked that it is bolded
    expect(await element(by.id('unit-row-13030')).getAttribute('class')).toBe('unit-row unit-row-IDEVELOP filtered-unit');
  });

  /***********************************************************************************************************
   * 
   * 
   * Create child unit
   * 
   * 
   ************************************************************************************************************/
  it('should create child unit',  async () => {
    await browser.get('/#/unites');
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

  /***********************************************************************************************************
   * 
   * 
   * Update Unit
   * 
   * 
   ************************************************************************************************************/
  it('should update unit',  async () => {
    await browser.get('/#/unites');
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
    await browser.sleep(1000).then(function(){ });

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
    await browser.sleep(1000).then(function(){ });
    let roomInput = await element(by.id('input-room-search'));
    await roomInput.sendKeys('inn013');
    await roomInput.sendKeys(Key.ENTER);
    await browser.sleep(1000).then(function(){ });

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
    await browser.sleep(1000).then(function(){ });
    // Check that country has been updated in UI
    expect(await element(by.id('box-selected-country')).getText()).toBe('France');

    // Search for country "su"
    countrySearchInput.sendKeys('su');
    countrySearchInput.sendKeys(Key.ENTER);
    await browser.sleep(1000).then(function(){ });
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
    await browser.sleep(1000).then(function(){ });
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
    expect(await element.all(by.className('tr-history-row')).count()).toEqual(14);
    await browser.sleep(1000).then(function(){ });

    //************************************************************************
    // Move it
    //************************************************************************
    // Go back to "Données de base" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Données de base')).click();
    await browser.sleep(500).then(function(){ });
    let parentSearchInput = await element(by.id('input-parent-search'));
    parentSearchInput.sendKeys('gouv');
    parentSearchInput.sendKeys(Key.ENTER);
    await browser.sleep(1000).then(function(){ });
    // Check that parent has been updated in UI
    expect(await element(by.id('box-selected-parent')).getText()).toBe('SI-GOUV (SI - Gouvernance et planification)');

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });

    // IDEVELOP2 should have disappeared (10 -> 9)
    expect(await element.all(by.className('unit-row')).count()).toEqual(9);

    // Now open SI-GOUV
    await element(by.id('chevron-cell-13026')).click();
    await browser.sleep(1000).then(function(){ });

    // IDEVELOP2 should appear in SI-GOUV (9 + 2 -> 11)
    expect(await element.all(by.className('unit-row')).count()).toEqual(11);


    //************************************************************************
    // Close it
    //************************************************************************
    await element.all(by.className('label-cell-IDEVELOP2')).get(0).click();
    await browser.sleep(1000).then(function(){ });

    let toInput = await element(by.id('input-to'));
    // Put a date before the validFrom
    await toInput.clear();
    await toInput.sendKeys('1.1.13');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 1 error displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(1);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Put an invalid date
    await toInput.clear();
    await toInput.sendKeys('31.02.2018');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 1 error displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(1);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(500).then(function(){ });

    // Put an valid date
    await toInput.clear();
    await toInput.sendKeys('01.1.2018');

    // Save unit
    await element(by.id('btn-save-unit')).click();
    await browser.sleep(1000).then(function(){ });

    // Go on "Compléments" tab
    await element.all(by.cssContainingText('a.nav-link > span', 'Compléments')).click();
    await browser.sleep(500).then(function(){ });

    // Check that close dates are set for all attributes
    expect(await element.all(by.cssContainingText('.attribute-validity-period', '01.01.2018')).count()).toBe(1);
  });

  /***********************************************************************************************************
   * 
   * 
   * Create Model Unit
   * 
   * 
   ************************************************************************************************************/
  it('should create model unit',  async () => {
    await browser.get('/#/unites');
    await browser.sleep(500).then(function(){ });

    // Open EPFL / SI / SI-IDEV
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(500).then(function(){ });
    await element(by.id('chevron-cell-12635')).click();
    await browser.sleep(500).then(function(){ });

    // Icon should be faded
    expect(await element(by.id('manage-model-unit-13028')).getAttribute('style')).toBe('opacity: 0.33;');

    await element(by.id('manage-model-unit-13028')).click();
    await browser.sleep(1000).then(function(){ });
    
    // modal should be opened
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);

    // Update information
    let labelInput = await element(by.id('input-label'));
    await labelInput.clear();
    await labelInput.sendKeys('SI - ');
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.clear();
    await sigleInput.sendKeys('IDEV');
    let labelShortInput = await element(by.id('input-labelShort'));
    await labelShortInput.clear();
    await labelShortInput.sendKeys('SI - ');
    let cfInput = await element(by.id('input-cf'));
    // clear() doesn't work as expected, even if input if blank on screen, it still has a value...
    await cfInput.sendKeys(Key.BACK_SPACE);
    await cfInput.sendKeys(Key.BACK_SPACE);
    await cfInput.sendKeys(Key.BACK_SPACE);
    await cfInput.sendKeys(Key.BACK_SPACE);
    await cfInput.sendKeys(Key.BACK_SPACE);
    let fromInput = await element(by.id('input-from'));    
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await fromInput.sendKeys(Key.BACK_SPACE);
    await browser.sleep(1000).then(function(){ });
    
    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(1000).then(function(){ });

    // Modal should close
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(false);

    // Icon should be bolded
    expect(await element(by.id('manage-model-unit-13028')).getAttribute('style')).toBe('');

    // Create child unit to check if model values are being populated
    await element(by.id('create-child-unit-13028')).click();
    await browser.sleep(1000).then(function(){ });

    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(true);
    expect(await element(by.id('btn-save-unit')).isEnabled()).toBe(false);
    expect(await element(by.id('btn-save-unit-and-close')).isEnabled()).toBe(false);
    
    // type mandatory info
    await labelInput.sendKeys('Développement2');
    await sigleInput.sendKeys('ELOP2');
    await labelShortInput.sendKeys('Développement2');
    await cfInput.sendKeys('1999');
    await fromInput.sendKeys('1.1.17');
    await browser.sleep(1000).then(function(){ });

    await element(by.id('btn-close-unit-update')).click();
    await browser.sleep(1000).then(function(){ });

    // Now, delete the model
    await element(by.id('manage-model-unit-13028')).click();
    await browser.sleep(1000).then(function(){ });
    await element(by.id('btn-delete-unit-model')).click();
    await browser.sleep(1000).then(function(){ });

    // Icon should be faded
    expect(await element(by.id('manage-model-unit-13028')).getAttribute('style')).toBe('opacity: 0.33;');
  });

  /***********************************************************************************************************
   * 
   * 
   * Create Planned Unit
   * 
   * 
   ************************************************************************************************************/
  it('should create planned unit',  async () => {
    await browser.get('/#/unites');
    await browser.sleep(500).then(function(){ });

    // Open EPFL / SI / SI-IDEV
    await element(by.id('chevron-cell-10000')).click();
    await browser.sleep(500).then(function(){ });
    await element(by.id('chevron-cell-12635')).click();
    await browser.sleep(500).then(function(){ });
    await element(by.id('chevron-cell-13028')).click();
    await browser.sleep(500).then(function(){ });

    // Icon should be faded
    expect(await element(by.id('manage-planned-unit-13030')).getAttribute('style')).toBe('opacity: 0.33;');

    // Click to show the planned unit list
    await element(by.id('manage-planned-unit-13030')).click();
    await browser.sleep(1000).then(function(){ });
    
    // modal should be opened
    expect(await element(by.id('modal-unit-planned-list')).isDisplayed()).toBe(true);

    // Create a new Unit Planned
    await element(by.id('btn-create-unit-planned')).click();
    await browser.sleep(2000).then(function(){ });

    // Update information
    let applyAtInput = await element(by.id('input-applyAt'));
    
    // Type date in the past
    await applyAtInput.clear();
    await applyAtInput.sendKeys('1.1.17');
    await browser.sleep(500).then(function(){ });

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(2000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 1 error displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(1);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(1000).then(function(){ });

    // Type invalid date
    await applyAtInput.clear();
    await applyAtInput.sendKeys('31.2.2030');
    await browser.sleep(500).then(function(){ });
        
    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(2000).then(function(){ });
    // The alert modal should be displayed
    expect(await element(by.id('modal-alerts')).isDisplayed()).toBe(true);
    // There should be 1 error displayed
    expect(await element.all(by.className('search-result-box-error')).count()).toEqual(1);
    // Close alerts modal
    await element(by.id('btn-close-modal-alerts')).click();
    await browser.sleep(1000).then(function(){ });

    // Type valid date
    await applyAtInput.clear();
    await applyAtInput.sendKeys('31.01.30');
    await browser.sleep(500).then(function(){ });

    // Save unit
    await element(by.id('btn-save-unit-and-close')).click();
    await browser.sleep(2000).then(function(){ });

    // Modal should close
    expect(await element(by.id('modal-update-unit')).isDisplayed()).toBe(false);

    // Modal of list should show
    expect(await element(by.id('modal-unit-planned-list')).isDisplayed()).toBe(true);
    // There should be 1 row
    expect(await element.all(by.className('unit-planned-row')).count()).toBe(1);
    // Close it
    await element(by.id('btn-close-unit-planned-list')).click();
    await browser.sleep(1000).then(function(){ });

    // Icon should be bolded
    expect(await element(by.id('manage-planned-unit-13030')).getAttribute('style')).toBe('');

    // Delete the unit planned
    // Click to show the planned unit list
    await element(by.id('manage-planned-unit-13030')).click();
    await browser.sleep(1000).then(function(){ });

    // modal should be opened
    expect(await element(by.id('modal-unit-planned-list')).isDisplayed()).toBe(true);

    // Click on first one
    await element.all(by.className('unit-planned-row')).get(0).click();
    await browser.sleep(1000).then(function(){ });

    await element(by.id('btn-delete-unit-planned')).click();
    await browser.sleep(1000).then(function(){ });
    
    // modal should be opened
    expect(await element(by.id('modal-unit-planned-list')).isDisplayed()).toBe(true);
    // Close it
    await element(by.id('btn-close-unit-planned-list')).click();
    await browser.sleep(1000).then(function(){ });

    // Icon should be faded
    expect(await element(by.id('manage-planned-unit-13030')).getAttribute('style')).toBe('opacity: 0.33;');
  });

  // /***********************************************************************************************************
  //  * 
  //  * 
  //  * Delete Unit
  //  * 
  //  * 
  //  ************************************************************************************************************/
  // it('should delete unit from search',  async () => {
  //   // Delete created unit
  //   await browser.get('/#/recherche');
  //   let sigleInput = await element(by.id('input-sigle'));
  //   await sigleInput.clear();
  //   await sigleInput.sendKeys('iDevelOP2');
  //   await element(by.id('search-button')).click();
  //   await browser.sleep(1000).then(function(){ });
  //   // Click on delete button
  //   //let deleteButtons = await element.all(by.className('icon-delete-unit')).get(0).click();
  //   let count = await element.all(by.className('icon-delete-unit')).count();
  //   let deleteButtons = await element.all(by.className('icon-delete-unit'));
  //   //for (let deleteButton of await element.all(by.className('icon-delete-unit'))) {
  //   while (count > 0) {
  //     await element.all(by.className('icon-delete-unit')).get(0).click();
  //     await browser.sleep(1000).then(function(){ });
  //     // Check that deletion popup is displayed
  //     expect(await element(by.id('modal-delete-unit')).isDisplayed()).toBe(true);
  //     // Confirm delete by clicking on the button
  //     await element(by.id('btn-delete-unit-confirmation')).click();
  //     await browser.sleep(1000).then(function(){ });
  //     count = await element.all(by.className('icon-delete-unit')).count();
  //   }
  // });
});
