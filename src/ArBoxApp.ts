import moment from 'moment';
import queryString from 'query-string';
import {config} from 'dotenv';
import ArBoxAppConnection from './connetion';
import {
  Arbox,
  ConvertedLead,
  EnedeMembership,
  Lead,
  LeadExtended,
} from './types/arbox';
import {SearchQueryResult} from './types/query';
import {Reports} from './types/reports';
import {Customers} from './types/customers';
import {Schedule} from './types/schedule';

config();

export default class ArBoxApp {
  private readonly connection: ArBoxAppConnection;

  constructor(
    boxId: number,
    boxName: string,
    locationId: number,
    token: string,
    email: string,
    password: string,
    debug = false
  ) {
    this.connection = new ArBoxAppConnection(
      {
        boxId,
        locationId,
        boxName,
        token,
        email,
        password,
      },
      debug
    );
  }

  async getAllCustomers() {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<string>(
      `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/getUsersAndLeadsJson`,
      'GET'
    );
    return dataReq.data;
  }

  // מנויים פעילים
  async getAllActiveCustomers() {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<Arbox.ActiveMember[]>(
      `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/activeMembers/detailedReport/null`,
      'GET'
    );
    return dataReq.data;
  }

  // https://api.arboxapp.com/index.php/api/v1/box/226/getActiveUsersWithMembership
  async getActiveUsersWithMembership() {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<Arbox.MemberCustomer[]>(
      `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/getActiveUsersWithMembership`,
      'GET'
    );
    return dataReq.data;
  }

  // ריכוז לקוחות פעילים

  async getLeadAttendance(leadId: number | string) {
    const conn = await this.ensureConnection();
    try {
      const dataReq = await conn.serverRequest<
        [Schedule.Attendance] | undefined
      >(
        `https://api.arboxapp.com/index.php/api/v1/lead/${leadId}/schedules`,
        'POST'
      );
      return dataReq.data;
    } catch (e) {
      return undefined;
    }
  }

  async getEndingMembership(
    fromDate = moment().format('YYYY-MM-DD'),
    toDate = moment().format('YYYY-MM-DD')
  ) {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<EnedeMembership[]>(
      `https://api.arboxapp.com/index.php/api/v1/user/getEndingMembership/${this.connection.config.boxId}`,
      'POST',
      {
        fromDate,
        toDate,
        ended: true,
      }
    );
    return dataReq.data;
  }

  async getAllCustomersExtraDataDump() {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<Customers.ExtraData[]>(
      `https://api.arboxapp.com/index.php/api/v1/user/${this.connection.config.boxId}/extraData/`,
      'POST'
    );
    return dataReq.data;
  }

  async getAllOpenLeads() {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<[Lead]>(
      `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/openLeads/null`,
      'GET'
    );
    return dataReq.data;
  }

  // https://api.arboxapp.com/index.php/api/v1/box/226/openLeads

  async getConvertedLeads(
    fromDate = moment().format('YYYY-MM-DD'),
    toDate = moment().format('YYYY-MM-DD')
  ) {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<[ConvertedLead]>(
      `https://api.arboxapp.com/index.php/api/v1/lead/getLeadConverted/${this.connection.config.boxId}`,
      'POST',
      {fromDate, toDate}
    );
    return dataReq.data;
  }

  async getTransactions(
    fromDate = moment().format('YYYY-MM-DD'),
    toDate = moment().format('YYYY-MM-DD')
  ) {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<[Arbox.Transaction]>(
      'https://api.arboxapp.com/index.php/api/v1/reports/global/transactions',
      'POST',
      {fromDate, toDate}
    );
    return dataReq.data;
  }

  async getBoxSales(
    fromDate = moment().format('YYYY-MM-DD'),
    toDate = moment().format('YYYY-MM-DD'),
    reportType = 'detailedReport'
  ) {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest<Arbox.Sales>(
      'https://api.arboxapp.com/index.php/api/v1/reports/getBoxSales',
      'POST',
      {
        from_date: fromDate,
        to_date: toDate,
        report_type: reportType,
      }
    );
    return dataReq.data;
  }

  async addLead(
    firstName: string,
    lastName: string,
    phone: string,
    email = 'none@none.com',
    comment = `created at ${moment().format()}`,
    status = 1623,
    source = 1145,
    locationBoxFk = this.connection.config.boxId
  ) {
    const conn = await this.ensureConnection();
    const dataReq = await conn.serverRequest(
      `https://api.arboxapp.com/index.php/api/v1/lead/${this.connection.config.boxId}`,
      'POST',
      {
        allow_mailing_list: 'unknown',
        allow_sms: 'unknown',
        comment,
        email,
        firstName,
        lastName,
        locationBoxFk,
        phone,
        source,
        status,
      }
    );
    return dataReq.data;
  }

  async getLead(leadId: number) {
    const conn = await this.ensureConnection();

    const {data} = await conn.serverRequest<LeadExtended>(
      `https://api.arboxapp.com/index.php/api/v1/lead/getById/${leadId}`,
      'GET'
    );

    return data;
  }

  async getLeadTasks(leadId: number) {
    const conn = await this.ensureConnection();

    const {data} = await conn.serverRequest<Arbox.Task>(
      `https://api.arboxapp.com/index.php/api/v1/tasks/${this.connection.config.boxId}/lead/${leadId}`,
      'GET'
    );

    return data;
  }

  async getLeadSchedule(leadId: number) {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest<[Arbox.LeadSchedule]>(
      `https://api.arboxapp.com/index.php/api/v1/lead/${leadId}/schedules`,
      'POST'
    );

    return data;
  }

  async updateLeadStatus(leadId: number, comment = '', newStatus = '1629') {
    const conn = await this.ensureConnection();
    const params = {
      boxId: this.connection.config.boxId,
      comment,
      leadId,
      newStatus,
    };

    const {data} = await conn.serverRequest<Lead>(
      `https://api.arboxapp.com/index.php/api/v1/lead/updateStatus/${leadId}`,
      'POST',
      params
    );

    return data;
  }

  async addUserTask(
    userId: number,
    description: string,
    taskType: Arbox.TaskType,
    reminderDate: Date,
    systemUser?: Arbox.SystemUser
  ) {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest(
      'https://api.arboxapp.com/index.php/api/v1/tasks',
      'POST',
      {
        systemUser,
        boxFk: this.connection.config.boxId,
        description,
        done: 0,
        doneTime: null,
        isNotified: 0,
        reminderDate: moment().format('YYYY-MM-DDTHH:MM:00.259Z'),
        reminder: {
          reminderDate: moment(reminderDate).format('YYYY-MM-DDTHH:MM:00.259Z'),
        },
        targetableId: userId,
        targetableType: 'user',
        taskType,
        reminderTime: moment(reminderDate).format('YYYY-MM-DDTHH:MM:00.259Z'),
        taskOwnerUserFk: 56841,
      }
    );
    return data;
  }

  async getAllTasks(
    fromDate = moment().startOf('week').format('YYYY-MM-DD'),
    toDate = moment().endOf('week').format('YYYY-MM-DD')
  ) {
    const conn = await this.ensureConnection();

    const getTaskPage = async (page = 1): Promise<Arbox.Tasks> => {
      const res = await conn.serverRequest<Arbox.Tasks>(
        `https://api.arboxapp.com/index.php/api/v1/tasks/226/betweenDates/1?page=${page}`,
        'POST',
        {
          fromDate,
          toDate,
          tabType: 'allTasks',
          filterByTask: null,
          filterByLocationBox: null,
        }
      );
      return res.data;
    };

    let page = 0;
    let pageResults: Arbox.Tasks | null;
    const allResults: Arbox.Tasks = {
      allTasks: [],
    };

    do {
      // eslint-disable-next-line no-plusplus,no-await-in-loop
      pageResults = await getTaskPage(page++);
      allResults.allTasks = allResults.allTasks.concat(pageResults.allTasks);
    } while (pageResults.allTasks.length > 0);

    return allResults;
  }

  async getBirthdays(
    from = moment().startOf('week').toDate(),
    to = moment().endOf('week').toDate()
  ) {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest<Arbox.Birthday>(
      `https://api.arboxapp.com/index.php/api/v1/user/GetTodayBirthdays/${this.connection.config.boxId}`,
      'POST',
      {
        fromDate: moment(from).format('YYYY-MM-DD'),
        toDate: moment(to).format('YYYY-MM-DD'),
      }
    );
    return data;
  }

  /**
   * @DEPRECATED use "getSchedule" instead
   * @param fromDate
   * @param toDate
   * @param location
   */

  // https://api.arboxapp.com/index.php/api/v1/rangeSchedule/226?fromDate=2021-03-14&toDate=2021-03-21&location=282&coach=undefined&schedule=undefined
  async getLessons(fromDate: Date | string, toDate: Date | string) {
    const conn = await this.ensureConnection();
    const {locationId, boxId} = this.connection.config;

    const queryParams = queryString.stringify({
      fromDate: moment(fromDate).format('YYYY-MM-DD'),
      toDate: moment(toDate).format('YYYY-MM-DD'),
      location: locationId,
      coach: undefined,
      schedule: undefined,
    });

    const {data} = await conn.serverRequest<Schedule.ScheduleLesson>(
      `https://api.arboxapp.com/index.php/api/v1/rangeSchedule/${boxId}?${queryParams}`,
      'GET'
    );
    return data;
  }

  async getLessonMembers(lessonId: number) {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest<Schedule.LessonMembers>(
      `https://api.arboxapp.com/index.php/api/v1/schedule/${lessonId}/members`,
      'GET'
    );
    return data;
  }

  async searchByName(query: string) {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest<SearchQueryResult>(
      `https://api.arboxapp.com/index.php/api/v1/searchForMember/${encodeURIComponent(
        query
      )}`,
      'GET'
    );
    return data;
  }

  async getMembersProperties() {
    const conn = await this.ensureConnection();
    const {data} = await conn.serverRequest<Reports.MemberProperties[]>(
      `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/checkboxesUserBox`,
      'POST'
    );

    return data;
  }

  async getSuspendedUsers(
    startDate = moment().format('YYYY-MM-DD'),
    endDate = moment().endOf('month').format('YYYY-MM-DD')
  ) {
    const conn = await this.ensureConnection();
    const url = `https://api.arboxapp.com/index.php/api/v1/user/getSuspendedUsers/${this.connection.config.boxId}/${startDate}/${endDate}/null`;
    const {data} = await conn.serverRequest<Reports.SuspendedUser[]>(
      url,
      'GET'
    );
    return data;
  }

  async getStats() {
    const conn = await this.ensureConnection();

    const debtUrl = `https://api.arboxapp.com/index.php/api/v1/box/${this.connection.config.boxId}/dashboard/getStats/getMembersDebtsByBox`;
    const {data: debtCount} = await conn.serverRequest<number>(debtUrl, 'GET');

    const activePlanMembersUrl = `https://api.arboxapp.com/index.php/api/v1/box/${
      this.connection.config.boxId
    }/dashboard/getStats/getActivePlanMembers/history?to_date=${moment().format(
      'YYYY-MM-DD'
    )}&from_date=${moment().subtract(6, 'month').format('YYYY-MM-DD')}`;
    const {
      data: {recent: activePlanMembersCount},
    } = await conn.serverRequest<{
      recent: number;
    }>(activePlanMembersUrl, 'GET');
    return {activePlanMembersCount, debtCount};
  }

  private async ensureConnection() {
    await this.connection.forceConnection();
    return this.connection;
  }
}
