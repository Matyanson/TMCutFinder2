export default interface SearchSettings {
    limit: number,
    maxLengthMultiple: number,
    insertOnlyShorter: boolean,
    ringRespawn: boolean,
    turnAround: boolean,
    turnAroundPenalty: number
}