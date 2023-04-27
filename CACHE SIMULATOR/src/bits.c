#include "bits.h"
#include "cache.h"

// address is TAG SET OFFSET
int get_set(Cache *cache, address_type address) {
  // TODO:
  //  Extract the set bits from a 32-bit address.
  //
  int set_bits = cache->set_bits;
  int offset_bits = cache->block_bits;
  //make the mask by getting all 1's, then shifting 
  address_type mask = (1 << set_bits) - 1;
  //creates 1's for extracting set bits, by turning 1 into 1000 (0's based on set bits) then subtracting 1 to get 0111, which puts 1 on set bits 
  mask = mask << offset_bits; 
  //need the mask set bits in the right place
  address_type set_bits_only = (address & mask);
  set_bits_only = set_bits_only >> offset_bits;
  //removes offset bits so the rightmost (first) bits are the answer


  return set_bits_only;
}

int get_line(Cache *cache, address_type address) {

  int set_bits = cache->set_bits;
  int offset_bits = cache->block_bits;

  int tag_bits = 32 - set_bits - offset_bits;

  //This makes the extraction part of the mask: the 1's. Make it 1 << desired bits num of 0, then sub 1
  unsigned int mask = (1 << tag_bits) - 1;
  // Move 1's over to correct area (past set and block offset bits)
  mask = mask << (set_bits + offset_bits);
  // apply mask
  unsigned int tag_bits_only = (address & mask);
  // remove 0's to get just tag bits
  tag_bits_only = tag_bits_only >> (set_bits + offset_bits);
  return tag_bits_only;
}

int get_byte(Cache *cache, address_type address) {
  // TODO
  // Extract the block offset (byte index) bits from a 32-bit address.
  //
  int set_bits = cache->set_bits;
  int offset_bits = cache->block_bits;
  int tag_bits = 32 - set_bits - offset_bits;
  address_type mask = (1 << offset_bits) - 1;
  address_type offset_bits_only = (address & mask);

  return offset_bits_only;
}
