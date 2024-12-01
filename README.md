# GA4Dataform Community

GA4Dataform Community is the open-source version of GA4Dataform Core.
This open-source repository contains all the Dataform files and folders that the [GA4Dataform Installer](https://setup.ga4dataform.com/) creates in Dataform.

You can use this repository to:
1. Explore the code before installing it
2. Implement parts of our queries or functions to your existing code
3. Connect it to your Dataform repository by yourself

Please take a look at our [documentation](https://docs.ga4dataform.com/docs/) if you want to learn more about GA4Dataform!

## Installation

If you want to install our most up-to-date version of GA4Dataform or an easy and quick way to deploy it to your project, please use the [Installer](https://setup.ga4dataform.com/)!

We will try to keep this open-source repository as updated as we can, but there might be some delay. Use this repository at your own risk!

## Connect your Dataform repository

Connecting your Dataform repository to this Github repo (even just temporarily) is probably the least amount of effort to move all files and folders to your workspace.

### Prerequisites
* Your project has billing enabled
* You have proper [permissions](https://docs.ga4dataform.com/docs/permissions)
* [Secret Manager API](https://console.cloud.google.com/apis/api/secretmanager.googleapis.com/metrics) is enabled
* [Dataform service account](https://console.cloud.google.com/iam-admin/iam) has `Secret Manager, Secret Accessor` role

### Steps
1. Navigate to [Dataform](https://console.cloud.google.com/bigquery/dataform)
2. Select the repository you want to connect
3. Click on `Settings`
4. Select `HTTPS` and paste in this link: `https://github.com/superformlabs/ga4dataform.git`
5. Set your default branch to `main`
6. Create a new secret with any name and value
7. Click `Link`
8. Create a new workspace (it will automatically pull in the files)
9. Lastly, feel free to `Delete Connection` in the `Settings` tab

## About Us
GA4Dataform is a product by Superform Labs OÜ. Our company is settled in Estonia (EU), but we work remotely from different countries across the world. Together we have decades of experience in web and marketing analytics.

- **Jules Stuifbergen** | Data Analyst | [LinkedIn](https://www.linkedin.com/in/stuifbergen/)
- **Krisztián Korpa** | Analytics Engineer | [LinkedIn](https://www.linkedin.com/in/krisztian-korpa/)
- **Artem Korneev** | Analytics Developer | [LinkedIn](https://www.linkedin.com/in/artem-korneev/)
- **Simon Breton** | Analytics Engineer | [LinkedIn](https://www.linkedin.com/in/simonbreton/)
- **Johan van de Werken** | Data Analyst | [LinkedIn](https://www.linkedin.com/in/johanvdwerken/)

## Contact
If you have any further questions, feel free to contact us at: [support@ga4dataform.com](mailto:support@ga4dataform.com).

## License
GNU General Public License. This file is part of "GA4 Dataform Package". Copyright (C) 2023-2024 Superform Labs Artem Korneev, Jules Stuifbergen, Johan van de Werken, Krisztián Korpa, Simon Breton. "GA4 Dataform Package" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not see [GNU licenses](http://www.gnu.org/licenses/)