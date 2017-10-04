import { browser, by, element, ExpectedConditions, Key } from 'protractor';
import 'tslib';

describe('search', () => {

  beforeEach(async () => {
    await browser.get('/#/recherche');
  });

  it('should search',  async () => {
    // sigle search
    let sigleInput = await element(by.id('input-sigle'));
    await sigleInput.clear();
    await sigleInput.sendKeys('idev');
    await element(by.id('search-button')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element(by.id('results-table')).isDisplayed()).toBe(true);
    expect(await element.all(by.className('result-tr')).count()).toEqual(3);

    // type a CF
    let cfInput = await element(by.id('input-cf'));
    await cfInput.clear();
    await cfInput.sendKeys('1906');
    await element(by.id('search-button')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element(by.id('results-table')).isDisplayed()).toBe(true);
    expect(await element.all(by.className('result-tr')).count()).toEqual(1);

    // type a responsible and ENTER
    let responsibleInput = await element(by.id('input-responsible'));
    await responsibleInput.clear();
    await responsibleInput.sendKeys('delo');
    await responsibleInput.sendKeys(Key.ENTER);
    await browser.sleep(3000).then(function(){ });
    expect(await element(by.id('search-responsible-modal')).isDisplayed()).toBe(true);
    await element(by.id('select-responsible-268229')).click();
    await browser.sleep(2000).then(function(){ });
    await element(by.id('search-button')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element(by.id('results-table')).isDisplayed()).toBe(true);
    expect(await element.all(by.className('result-tr')).count()).toEqual(1);

    // clear responsible, type a partial one, and click search
    await element(by.id('clear-responsible-button')).click();
    responsibleInput = await element(by.id('input-responsible'));
    await responsibleInput.clear();
    await responsibleInput.sendKeys('delo');
    await element(by.id('search-button')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element(by.id('search-responsible-modal')).isDisplayed()).toBe(true);
    await element(by.id('select-responsible-268229')).click();
    await browser.sleep(2000).then(function(){ });
    expect(await element(by.id('results-table')).isDisplayed()).toBe(true);
    expect(await element.all(by.className('result-tr')).count()).toEqual(1);    
  });
});
