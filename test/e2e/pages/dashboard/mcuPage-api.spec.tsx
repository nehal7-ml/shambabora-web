import { test, expect } from '@playwright/test'

test('Navigation on the Manage Amcos menu', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('text=Login')).toBeVisible()

  //  Need to double click here to get the new page
  await page.getByRole('link', { name: /login/i }).click()
  await page.getByRole('link', { name: /login/i }).click()

  await expect(page).toHaveURL(/.*\/sign-in.*/)
  await expect(page).toHaveURL(/.*\/sign-in.*/)

  //  These e-mail and password need to be externilized so that we can do multiple user tests
  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");

  // 5. Optional: Click the submit button if available
  const loginButton = page.getByRole('button', { name: /sign in|login/i })
  if (await loginButton.isVisible()) {
    await loginButton.click()
  }

  await expect(page).toHaveURL(/dashboard/i)
  await expect(page).toHaveTitle(/Shamba Bora/)


  await page.getByRole('button', { name: /Manage Amcos/i }).click()
  await page.getByRole('link', { name: /Mcu/i }).click()

  await page.route('**/api/v1/mcus/', async (route) => {
    const mockedData = [
      {
        'id': 1,
        'name': 'Kyela MCU someone',
        'type': 'AGRICULTURAL',
        'region': 1,
        'regionName': 'Dar',
        'address': 'kyela district',
        'registrationNumber': '10004023',
        'phoneNumber': '255783512912',
        'email': 'kyela@district.co.tz',
        'tinNumber': '10004023',
        'website': 'www.kyela.co.tz',
        'contactPersonName': 'Alpha Codes',
        'contactPersonPhoneNumber': '255783512912',
        'contactPersonEmail': 'alphacodes@gmail.com',
        'contactPersonTitle': 'Alpha Codes',
        'status': 'Active'
      }]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedData)
    })
  })

  await expect(page).toHaveURL('/dashboard/mcus')

  await expect(page.getByRole('heading', { name: 'Mcu' })).toBeVisible()
  await expect(page.getByText(/Here's a list of your MCUs/i)).toBeVisible({
    timeout: 10000
  })

  // Select all table rows excluding the header
  const rows = await page.locator('tbody tr')
  const rowCount = await rows.count()

  const expectedData = [
    { sno: '1', mcuName: 'Kyela MCU someone', region: 'Dar' }
  ]


  expect(rows).toHaveCount(expectedData.length)
  for (let i = 0; i < rowCount; i++) {
    const cells = rows.nth(i).locator('td')
    const sno = await cells.nth(1).innerText()
    const mcuName = await cells.nth(2).locator('span').innerText()
    const region = await cells.nth(3).locator('span').innerText()

    expect(sno.trim()).toBe(expectedData[i].sno)
    expect(mcuName.trim()).toBe(expectedData[i].mcuName)
    expect(region.trim()).toBe(expectedData[i].region)
  }
  expect(page.getByText('Kyela MCU someone')).toBeVisible()
  await expect(page.getByText('0 of 1 row(s) selected.')).toBeVisible()
})
