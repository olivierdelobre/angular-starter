describe('App', () => {

  beforeEach(() => {
    browser.get('/#/login');
    let usernameInput = element(by.id('username'));
    let usernamePassword = element(by.id('password'));
    usernameInput.clear();
    usernameInput.sendKeys('test');
    usernamePassword.clear();
    usernamePassword.sendKeys('test');

    element(by.css('button.btn-primary')).click();
  });


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

});
